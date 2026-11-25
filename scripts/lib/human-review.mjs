/** 사람 터미널용 검수 입력. 테스트의 모의 입력은 임시 저장소에서만 사용한다. */
import { createInterface } from "node:readline/promises";
import { existsSync, readFileSync, lstatSync, mkdirSync, openSync, closeSync, writeFileSync, renameSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { buildCatalog, generateCatalog } from "./catalog.mjs";
import { reviewChoices } from "./review-stories.mjs";

const bi = (ko, en) => `${ko} / ${en}`;

const usage = "사용법 / Usage: pnpm ds:review <Name> | pnpm ds:review --list (run it yourself; decision flags and piped input are not supported)";
const text = (value) => typeof value === "string" && value.trim().length > 0;
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const read = (path) => existsSync(path) ? readFileSync(path, "utf8") : null;

function paths(root) {
  const dir = join(root, ".ds");
  const file = join(dir, "catalog-review.json");
  for (const [path, directory] of [[dir, true], [file, false]]) {
    const stat = lstatSync(path, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isSymbolicLink() || (directory ? !stat.isDirectory() : !stat.isFile())) throw new Error(`검수 경로는 심볼릭 링크가 아닌 일반 ${directory ? "폴더" : "파일"}여야 합니다: ${path}`);
  }
  return { dir, file };
}

function documentFrom(original) {
  const data = original === null ? { schemaVersion: 1, components: {} } : JSON.parse(original);
  if (data?.schemaVersion !== 1 || !object(data.components) || (data.history !== undefined && !Array.isArray(data.history))) {
    throw new Error("검수 파일의 스키마 또는 history 형식이 잘못되었습니다. 기존 파일을 보존합니다.");
  }
  return data;
}

export function validateReviewScope(row, scope) {
  if (!Array.isArray(scope) || !scope.length) throw new Error("검수 범위는 비어 있지 않은 JSON 배열이어야 합니다.");
  for (const item of scope) {
    if (!object(item) || Object.keys(item).some((key) => !["props", "states"].includes(key)) || !object(item.props)
        || !Array.isArray(item.states) || !item.states.length || !item.states.every(text)) {
      throw new Error('각 범위에는 props 객체와 비어 있지 않은 states 문자열 배열이 필요합니다.');
    }
    for (const [name, value] of Object.entries(item.props)) {
      const options = row.props.find((p) => p.name === name)?.options ?? row.nativeScopeOptions[name];
      if (!Array.isArray(options) || !options.includes(value)) throw new Error(`검수 범위 ${name}: 공개된 유한 선택값만 기록할 수 있습니다. 문구·label 등은 확인 방법·증거에 적으세요.`);
    }
  }
  return scope;
}

/** --list는 읽기만 한다. 쓰기는 stdin/stdout 양쪽 TTY와 대화형 최종 확인을 요구한다. */
export async function runHumanReview({ root, args, input = process.stdin, output = process.stdout, ask }) {
  root = resolve(root);
  if (args.length !== 1 || (args[0] !== "--list" && !/^[A-Z][A-Za-z0-9]*$/.test(args[0]))) throw new Error(usage);
  const name = args[0];
  if (name !== "--list" && (!input.isTTY || !output.isTTY)) {
    throw new Error("사람이 직접 연결한 대화형 TTY에서만 검수 기록을 만들 수 있습니다. AI 셸·파이프·리다이렉션에서는 거부합니다. 사람이 터미널에서 직접 실행하세요.");
  }
  const catalog = await buildCatalog(root);
  if (name === "--list") {
    output.write(catalog.rows.map((r) => `${r.name} | ${r.review.status} | visual: ${r.review.visual.status}`).join("\n") + "\n");
    return;
  }
  const row = catalog.rows.find((r) => r.name === name);
  if (!row) throw new Error(`카탈로그에 없는 부품: ${name}`);
  const { dir, file } = paths(root);
  const original = read(file);
  const data = documentFrom(original);
  const context = await reviewChoices(root, row);
  if (!context.choices.length) throw new Error(bi("번호로 선택할 수 있는 검수 예시가 없습니다. 담당자에게 Storybook 예시 연결을 요청하세요.", "No reviewable examples were found. Ask the maintainer to connect Storybook examples."));
  output.write(bi(`학생 검수: ${name}`, `Student review: ${name}`) + "\n");
  output.write(bi("기본 부품을 고쳤다면 Storybook에서 직접 확인한 뒤 이 명령으로 다시 사용할 수 있게 합니다.", "If you changed a starter part, check it in Storybook yourself. This review can make the checked version available to your pages again.") + "\n");
  output.write(bi("비교 기준", "Reference") + ": " + context.label + "\n");
  output.write(bi("이름 아래의 모든 예시·변형을 Storybook에서 직접 확인하세요. 번호가 있는 항목만 기록됩니다.", "Inspect the listed examples and variations in Storybook. Only numbered items will be recorded.") + "\n");
  output.write(bi("AI에게 대신 기록시키지 마세요. 터미널 연결만으로 사람임을 증명하지는 않습니다.", "Do not ask AI to record a human review. A terminal connection does not prove human identity.") + "\n");
  output.write(row.checks.status === "not_run" ? bi("자동 검사: 현재 결과가 연결되어 있지 않습니다. 담당자에게 검사 결과를 확인하세요.", "Automated checks: no current result is linked. Ask the maintainer to confirm the results.") + "\n" : bi("자동 검사", "Automated checks") + ": " + row.checks.status + "\n");
  context.choices.forEach((choice, i) => output.write(`${i + 1}. ${choice.label}\n`));
  if (context.unavailable.length) output.write(bi(`자동 연결할 수 없거나 보류된 예시(이번 번호 선택에 포함되지 않음): ${context.unavailable.join(", ")}`, `Unresolved or held examples (not included in numbered selections): ${context.unavailable.join(", ")}`) + "\n");

  let rl;
  const abort = new AbortController();
  if (!ask) {
    rl = createInterface({ input, output, terminal: true });
    rl.on("close", () => abort.abort());
    rl.on("SIGINT", () => rl.close());
    ask = (prompt) => rl.question(prompt, { signal: abort.signal });
  }
  const question = async (prompt, parse = (v) => v) => {
    for (;;) {
      const answer = (await ask(prompt)).trim();
      if (!answer) throw new Error("입력을 취소했습니다. 검수 기록은 변경하지 않았습니다.");
      try { return parse(answer); }
      catch (error) { output.write(bi("입력 오류", "Invalid choice") + `: ${error.message}\n`); }
    }
  };
  try {
    const yesNo = async (prompt) => question(prompt + " (예/아니요, yes/no): ", (value) => {
      if (["예", "네", "yes", "y"].includes(value.toLowerCase())) return true;
      if (["아니요", "아니오", "no", "n"].includes(value.toLowerCase())) return false;
      throw new Error(bi("예 또는 아니요를 선택하세요.", "Choose yes or no."));
    });
    const reviewer = await question(bi("검수자 이름", "Reviewer name") + ": ");
    const all = await question(bi("확인 범위: 1 전부 확인함, 2 일부만 확인함", "Review scope: 1 checked all numbered items, 2 checked some") + ": ", (value) => {
      if (!["1", "2"].includes(value)) throw new Error(bi("1 또는 2를 선택하세요.", "Choose 1 or 2."));
      return value === "1";
    });
    const selected = all ? context.choices : await question(bi("확인한 번호를 쉼표로 구분하세요(예: 1,3)", "Enter checked numbers separated by commas (e.g. 1,3)") + ": ", (value) => {
      const numbers = value.split(/[,\s]+/).map(Number);
      if (!numbers.length || !numbers.every((n) => Number.isInteger(n) && n >= 1 && n <= context.choices.length)) throw new Error(bi("목록에 있는 번호만 선택하세요.", "Select numbers from the list."));
      return [...new Set(numbers)].map((n) => context.choices[n - 1]);
    });
    const checklist = [];
    const check = async (id, ko, en) => { checklist.push({ id, passed: await yesNo(bi(ko, en)) }); };
    await check("appearance", "선택한 모든 모양과 글자·그림이 제대로 보였나요?", "Did all selected appearances, text and icons look correct?");
    const interactive = (c) => c.props.disabled !== true && (!context.dismissOnly || c.props.dismissible === true);
    const enabled = selected.some(interactive);
    if (context.pointer && enabled) await check("pointer", "마우스를 올리고 누를 때 모양이 맞았나요?", "Did hover and pressed appearances look correct?");
    if (context.keyboard && enabled) await check("keyboard", "Tab 키로 이동하고 키보드로 사용할 수 있었나요? (버튼: Enter/Space)", "Could you navigate with Tab and use the keyboard? (buttons: Enter/Space)");
    if (selected.some((c) => c.props.disabled === true)) await check("disabled", "비활성 항목은 눌리거나 실행되지 않았나요?", "Did disabled items stay inactive when pressed?");
    if (row.apiStatus !== "supported") checklist.push({ id: "api", passed: false });
    const decision = checklist.every((c) => c.passed) ? "approved" : "rejected";
    if (decision === "rejected") output.write(bi("확인하지 못한 항목이 있어 반려로 기록합니다.", "At least one check failed. This review will be rejected.") + "\n");
    const note = decision === "rejected" ? await question(bi("메모: 문제가 있었던 부분을 적어 주세요", "Notes: describe what went wrong") + ": ")
      : (await ask(bi("메모(없으면 Enter)", "Notes (press Enter to skip)") + ": ")).trim();
    const states = ["default"];
    if (!context.keyboard && !context.pointer) states.push("static");
    if (checklist.find((c) => c.id === "pointer")?.passed) { if (context.hover) states.push("hover"); if (context.active) states.push("active"); }
    if (checklist.find((c) => c.id === "keyboard")?.passed) states.push("focus");
    const scope = [...new Map(selected.map((c) => {
      const item = { props: c.props, states: c.props.disabled === true ? ["default", "disabled"] : !interactive(c) ? ["default", "static"] : states };
      return [JSON.stringify(item), item];
    })).values()];
    validateReviewScope(row, scope);
    const record = { reviewVersion: 2, reviewer, source: context.source, scope,
      evidenceId: `Storybook: ${selected.map((c) => c.story).join(", ")}; ${checklist.map((c) => `${c.id}:${c.passed}`).join(", ")}; ${note}`,
      reviewedAt: new Date().toISOString(), note, checklist, examples: selected.map(({ story, file, props }) => ({ story, file, props })),
      behavior: { decision, codeHash: row.hashes.codeHash, cssHash: row.hashes.cssHash, dependencyHash: row.hashes.dependencyHash },
      visual: { decision, tokensHash: row.hashes.tokensHash } };
    output.write(bi(`검수 요약: ${selected.length}개, ${decision === "approved" ? "승인" : "반려"}`, `Review summary: ${selected.length} examples, ${decision}`) + "\n");
    if (!await yesNo(bi("선택한 범위와 답변을 저장할까요?", "Save the selected scope and answers?"))) throw new Error(bi("취소했습니다. 검수 기록을 변경하지 않았습니다.", "Cancelled. No review record was changed."));

    paths(root);
    mkdirSync(dir, { recursive: true });
    const lockPath = join(dir, "catalog-review.lock");
    const lock = openSync(lockPath, "wx");
    const temporary = join(dir, `catalog-review.${randomUUID()}.tmp`);
    try {
      if (read(file) !== original) throw new Error("입력 중 기존 검수 기록이 바뀌었습니다. 덮어쓰지 않았습니다. 다시 검수하세요.");
      const current = (await buildCatalog(root)).rows.find((r) => r.name === name);
      if (!current || JSON.stringify(current.hashes) !== JSON.stringify(row.hashes) || current.apiStatus !== row.apiStatus) {
        throw new Error("입력 중 코드·CSS·의존·토큰이 바뀌었습니다. 검수 기록을 저장하지 않았습니다.");
      }
      const currentContext = await reviewChoices(root, current);
      if (currentContext.inputHash !== context.inputHash) throw new Error(bi("입력 중 비교 기준이나 예시가 바뀌었습니다. 다시 검수하세요.", "The reference or examples changed during review. Review again."));
      if (read(file) !== original) throw new Error("검수 버전 확인 중 기존 검수 기록이 바뀌었습니다. 덮어쓰지 않았습니다.");
      if (Object.hasOwn(data.components, name)) {
        data.history ??= [];
        data.history.push({ component: name, record: data.components[name] });
      }
      data.components[name] = record;
      paths(root);
      writeFileSync(temporary, JSON.stringify(data, null, 2) + "\n", { flag: "wx", mode: 0o600 });
      renameSync(temporary, file);
    } finally {
      if (existsSync(temporary)) unlinkSync(temporary);
      closeSync(lock);
      unlinkSync(lockPath);
    }
    output.write(bi(`검수 기록 저장: ${name} (${decision === "approved" ? "승인" : "반려"})`, `Review saved: ${name} (${decision})`) + "\n");
    const generated = await generateCatalog(root);
    if (generated.result === "conflict") throw new Error("검수 기록은 저장됐지만 CATALOG.md의 수동 수정과 충돌했습니다. 문서를 덮어쓰지 않았습니다.");
    output.write(`카탈로그 ${generated.result}: ${name} | ${generated.catalog.rows.find((r) => r.name === name).review.status}\n`);
  } catch (error) {
    if (error.name === "AbortError") throw new Error("입력이 종료되어 취소했습니다. 검수 기록을 변경하지 않았습니다.");
    throw error;
  } finally { rl?.close(); }
}
