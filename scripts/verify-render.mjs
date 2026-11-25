#!/usr/bin/env node
/**
 * 렌더 검증 — 토큰이 **끝까지** 해석되는지 DOM 에서 확인한다.
 *
 * 스토리가 "등록"되는 것과 "제대로 그려지는" 것은 다르다. `--color-primary` 가
 * 정의만 되고 CSS 가 안 물리면 Storybook 목록엔 멀쩡히 뜬다. 그래서 실제
 * computed style 을 읽어 값이 투명/기본값이 아닌지 본다.
 *
 * playwright 가 있어야 한다. 스타터킷의 의존성은 아니다 — 있으면 쓰고 없으면
 * 안내만 하고 통과시킨다(빈 CI 를 빨갛게 만들지 않는다).
 *
 *   node scripts/ds.mjs all && pnpm storybook   # 다른 탭에서
 *   node scripts/verify-render.mjs
 */
const BASE = process.env.SB_URL ?? "http://localhost:6006";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    console.log("playwright 가 없어 렌더 검증을 건너뜁니다.");
    console.log("  pnpm add -D playwright && pnpm exec playwright install chromium");
    process.exit(0);
  }
}

let index;
try {
  index = await (await fetch(`${BASE}/index.json`)).json();
} catch {
  console.log(`${BASE} 에 Storybook 이 없습니다. 먼저 \`pnpm storybook\` 을 띄우세요.`);
  process.exit(1);
}
// --only=Modal,Tabs 로 좁힐 수 있다. 메모리가 빠듯할 때 전량 검증을 피한다.
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length).split(",").map((x) => x.trim().toLowerCase()) : null;
const stories = Object.values(index.entries)
  .filter((e) => e.type === "story")
  .filter((e) => !only || only.some((n) => e.title.toLowerCase().includes(n)));
if (only && !stories.length) {
  console.log(`--only=${only.join(",")} 에 맞는 스토리가 없습니다.`);
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e.message)));

// 문서 페이지(Overview/Foundation/Policy)와 컴포넌트 스토리는 보는 것이 다르다.
// 문서는 "내용이 실제로 채워졌는가", 컴포넌트는 "토큰이 해석됐는가".
const isDocsPage = (t) => /^(Overview|Foundation|Policy)\//.test(t);

// 토큰이 실제로 해석되는지는 컴포넌트가 아니라 :root 에서 한 번만 확인한다.
await page.goto(`${BASE}/iframe.html?id=${stories[0].id}&viewMode=story`, { waitUntil: "networkidle" });
const tokens = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const want = ["--color-primary", "--color-text", "--color-bg", "--radius-md", "--spacing", "--font-sans", "--text-body-1"];
  return Object.fromEntries(want.map((n) => [n, cs.getPropertyValue(n).trim()]));
});
const missingTokens = Object.entries(tokens).filter(([, v]) => !v).map(([k]) => k);

const rows = [];
for (const s of stories) {
  const before = errors.length;
  await page.goto(`${BASE}/iframe.html?id=${s.id}&viewMode=story`, { waitUntil: "networkidle" });
  await page.locator("#storybook-root").waitFor({ state: "attached", timeout: 15000 });
  const kind = isDocsPage(s.title) ? "docs" : "component";
  const probe = await page.evaluate((kind) => {
    const root = document.querySelector("#storybook-root");
    if (kind === "docs") {
      return {
        kind: "docs",
        heading: root?.querySelector("h2")?.textContent?.trim() ?? "",
        chars: (root?.textContent ?? "").trim().length,
        rows: root?.querySelectorAll("tbody tr").length ?? 0,
      };
    }
    // 포털 컴포넌트는 #storybook-root 밖(body)에 붙는다.
    const el =
      root?.querySelector('[data-testid^="ds-"]') ??
      document.body.querySelector('[data-testid^="ds-"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    // 컴포넌트마다 루트의 성격이 다르다 — Button 은 칠해진 상자지만 Pagination 의
    // 루트는 nav 컨테이너라 radius 도 배경도 없는 게 정상이다. 특정 속성을 단정하면
    // 영구 false positive 가 된다. 그래서 "스타일시트가 붙었는가"만 본다.
    // 1) 스타일시트에 이 요소들의 ds- 클래스를 고르는 규칙이 있는가 — "붙었는가"를 직접 본다.
    //    체크박스·스피너처럼 루트가 투명하고 모서리도 없는 것이 정상인 컴포넌트가 있어서
    //    겉모습만으로는 가를 수 없다.
    const nodes = [el, ...el.querySelectorAll('[class*="ds-"]')];
    const names = new Set(nodes.flatMap((n) => [...n.classList].filter((c) => c.startsWith("ds-"))));
    const hasRule = [...document.styleSheets].some((sheet) => {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        return false; // 다른 출처의 시트는 읽을 수 없다
      }
      return [...rules].some((r) => r.selectorText && [...names].some((c) => r.selectorText.includes(`.${c}`)));
    });
    // 2) 겉모습으로도 본다.
    const styled = hasRule || nodes.some((n) => {
      const c = getComputedStyle(n);
      // backgroundColor 만 보면 gradient 로 칠한 것을 놓친다(Slider 트랙).
      // boxShadow 로만 표시되는 것도 있다.
      return (
        c.borderRadius !== "0px" ||
        c.padding !== "0px" ||
        c.backgroundColor !== "rgba(0, 0, 0, 0)" ||
        c.backgroundImage !== "none" ||
        c.boxShadow !== "none" ||
        c.borderTopWidth !== "0px"
      );
    });
    return {
      kind: "component",
      styled,
      bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius,
      minH: cs.minHeight, font: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
      text: (el.textContent || "").trim().slice(0, 20),
    };
  }, kind);
  rows.push({ title: `${s.title}/${s.name}`, probe, storyErrors: errors.length - before });
}
await browser.close();

// 토큰이 안 물리면 기본값이 나온다 — 그 신호를 실패로 본다.
const DEFAULTS = { radius: "0px", font: "Times" };
let fail = 0;
console.log(`\n렌더 검증 — ${BASE}\n`);
if (missingTokens.length) {
  console.log(`  ✖ 토큰 미해석: ${missingTokens.join(", ")} — tokens.css 가 안 실렸습니다.\n`);
  fail += 1;
} else {
  console.log(`  ✔ 토큰 해석됨 — --color-primary=${tokens["--color-primary"]} --radius-md=${tokens["--radius-md"]} --spacing=${tokens["--spacing"]}\n`);
}
for (const r of rows) {
  const bad = [];
  const p = r.probe;
  let detail = "";
  if (!p) bad.push("요소 없음");
  else if (p.kind === "docs") {
    // 문서 페이지는 데이터가 비면 껍데기만 남는다 — 그것도 실패로 본다.
    if (!p.heading) bad.push("제목 없음");
    if (p.chars < 120) bad.push(`내용 부족(${p.chars}자)`);
    detail = ` "${p.heading}"`.padEnd(26) + ` ${String(p.chars).padStart(5)}자  표 ${String(p.rows).padStart(3)}행`;
  } else {
    // 토큰이 하나도 안 물리면 어느 자손에도 스타일이 없다 — 그것만 실패로 본다.
    if (!p.styled) bad.push("스타일시트 미적용");
    if (p.font.startsWith(DEFAULTS.font)) bad.push("--font 미해석");
    detail = ` bg=${p.bg.padEnd(20)} color=${p.color.padEnd(20)} r=${p.radius.padEnd(5)} h=${p.minH.padEnd(6)} "${p.text}"`;
  }
  if (r.storyErrors) bad.push(`콘솔 오류 ${r.storyErrors}`);
  if (bad.length) fail += 1;
  console.log(`  ${bad.length ? "✖" : "✔"} ${r.title.padEnd(32)}${detail}${bad.length ? `  ← ${bad.join(", ")}` : ""}`);
}
if (errors.length) {
  console.log(`\n콘솔 오류 ${errors.length}건:`);
  [...new Set(errors)].slice(0, 8).forEach((e) => console.log("   ", e.slice(0, 160)));
}
console.log(`\n${rows.length - fail}/${rows.length} 통과`);
process.exit(fail ? 1 : 0);
