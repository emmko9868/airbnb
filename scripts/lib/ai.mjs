/**
 * 설명 문장 보강 — **여기가 LLM 이 쓰이는 유일한 곳이다.**
 *
 * 계층 해석, variant 행렬, diff, 가드는 전부 결정적 코드다. LLM 에 맡기면
 * 같은 입력에 다른 답이 나와 lock 비교가 무의미해진다. 그래서 LLM 은
 * "사람이 안 쓴 설명을 대신 쓴다" 한 가지만 한다.
 *
 * 우선순위 (ds.config.json 의 ownership.description 을 따른다 — ownership.mjs):
 *   human·code  1. descriptions.json 의 human 항목 (절대 덮어쓰지 않음)  2. Figma  3. LLM 추측
 *   figma       1. Figma 의 component description                     2. human  3. LLM 추측
 *   LLM 추측은 source "ai-inferred" 로 남아 검토 대상이다.
 *
 * 추측은 **Figma 로 역주입하지 않는다.** 한 번이라도 넣으면 다음 읽기에서
 * 자기 추측을 "사람이 쓴 설명"으로 오인해 자기 강화 루프에 빠진다.
 */

import { ownerOf } from "./ownership.mjs";

const SYSTEM = [
  "너는 디자인 시스템 문서 작성자다.",
  "컴포넌트 이름과 variant 구조만 보고 그 컴포넌트가 무엇인지 한국어 한두 문장으로 설명한다.",
  "규칙:",
  "- 추측이라는 티를 내지 말고 단정적으로 쓴다. 다만 확신이 낮으면 confidence 를 낮춘다.",
  "- variant 이름을 그대로 나열하지 않는다. 언제 쓰는지를 쓴다.",
  "- 마크다운, 제목, 불릿을 쓰지 않는다. 평문 문장만.",
  "- 반드시 JSON 만 출력한다. 코드펜스 금지.",
].join("\n");

function userPrompt(spec) {
  const props = spec.props
    .map((p) => `${p.figmaName}(${p.kind}${p.options ? `: ${p.options.map((o) => o.figma).join(", ")}` : ""})`)
    .join(" / ") || "속성 없음";
  return [
    `컴포넌트 이름: ${spec.name}`,
    `Figma 페이지: ${spec.pageName || "(모름)"}`,
    `속성: ${props}`,
    `상태 variant: ${spec.pseudoStates.join(", ") || "없음"}`,
    `variant 조합 수: ${spec.variantCount}`,
    "",
    '출력 형식: {"description": "...", "confidence": 0.0~1.0}',
  ].join("\n");
}

/** 코드펜스·앞뒤 잡소리를 걷어내고 첫 JSON 객체만 꺼낸다. flash 급 모델은 자주 흘린다. */
export function parseJsonLoose(text) {
  const s = String(text ?? "").replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "");
  const start = s.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < s.length; i += 1) {
    if (s[i] === "{") depth += 1;
    else if (s[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(s.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

async function callModel(ai, apiKey, spec) {
  const res = await fetch(`${ai.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: ai.model,
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt(spec) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  const body = await res.json();
  const text = body?.choices?.[0]?.message?.content ?? "";
  const parsed = parseJsonLoose(text);
  if (!parsed?.description) throw new Error("JSON 파싱 실패");
  return {
    description: String(parsed.description).trim(),
    confidence: Math.min(0.6, Math.max(0.1, Number(parsed.confidence) || 0.4)),
  };
}

/**
 * @param {Array} specs      extractComponents 결과
 * @param {object} existing  descriptions.json 내용
 * @param {object} config    ds.config.json
 * @returns {{ descriptions: object, calls: number, notes: string[] }}
 */
export async function enrichDescriptions(specs, existing, config) {
  const out = { ...existing };
  const notes = [];
  let calls = 0;

  const pending = [];
  const humanWins = ownerOf(config, "description") !== "figma";
  for (const spec of specs) {
    const prev = out[spec.name];
    // human·code 소유면 사람이 쓴 설명은 절대 건드리지 않는다. figma 소유면 Figma 설명만 덮어쓴다.
    if (prev?.source === "human" && (humanWins || !spec.description)) continue;
    if (spec.description) {
      out[spec.name] = { description: spec.description, source: "figma", confidence: 1 };
      continue;
    }
    if (prev?.source === "ai-inferred" && prev.specHash === specHash(spec)) continue; // 이미 생성됨, 구조 그대로
    pending.push(spec);
  }

  if (!pending.length) {
    notes.push("설명을 새로 만들 대상이 없습니다.");
    return { descriptions: out, calls, notes };
  }
  if (!config.ai?.enabled) {
    notes.push(`설명 없는 컴포넌트 ${pending.length}개 — ai.enabled=false 라 건너뜁니다.`);
    return { descriptions: out, calls, notes };
  }
  const apiKey = process.env[config.ai.apiKeyEnv];
  if (!apiKey) {
    notes.push(`설명 없는 컴포넌트 ${pending.length}개 — 환경변수 ${config.ai.apiKeyEnv} 가 없어 건너뜁니다.`);
    return { descriptions: out, calls, notes };
  }

  const limit = config.ai.maxCalls ?? 80;
  for (const spec of pending) {
    if (calls >= limit) {
      notes.push(`호출 상한 ${limit} 에 걸려 ${pending.length - calls}개를 남겼습니다.`);
      break;
    }
    try {
      const got = await callModel(config.ai, apiKey, spec);
      out[spec.name] = { ...got, source: "ai-inferred", model: config.ai.model, specHash: specHash(spec) };
      calls += 1;
    } catch (error) {
      notes.push(`${spec.name}: ${String(error?.message ?? error)}`);
    }
  }
  return { descriptions: out, calls, notes };
}

/** variant 구조가 바뀌면 설명을 다시 만든다. 이름만 같고 속살이 달라졌을 수 있다. */
export function specHash(spec) {
  const key = [spec.name, ...spec.props.map((p) => `${p.figmaName}:${(p.options ?? []).map((o) => o.figma).join("|")}`)].join(";");
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

/**
 * 우선순위대로 하나를 고른다. 생성기는 이 결과만 본다.
 * ownership.description 이 human·code 면 사람이 쓴 설명이 Figma 설명보다 먼저다.
 */
export function resolveDescription(spec, descriptions, config) {
  const d = descriptions?.[spec.name];
  if (ownerOf(config, "description") !== "figma" && d?.source === "human" && d.description) {
    return { text: d.description, source: "human" };
  }
  if (spec.description) return { text: spec.description, source: "figma" };
  if (d?.description) return { text: d.description, source: d.source ?? "ai-inferred" };
  return { text: "", source: "none" };
}
