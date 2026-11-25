#!/usr/bin/env node
/**
 * 상호작용 검증 — 컴포넌트를 실제로 눌러·입력해 보고 동작하는지 확인한다.
 *
 * verify-render 는 "제대로 그려지는가"를 본다. 이건 "제대로 동작하는가"를 본다 —
 * 체크박스가 체크되는지, 드롭다운이 고른 뒤 닫히는지, 모달이 Esc 로 닫히고 포커스가
 * 돌아오는지. 모양은 멀쩡한데 type 이 빠져 글자가 입력되는 체크박스 같은 것을 잡는다.
 *
 *   pnpm storybook                  # 한쪽 터미널
 *   pnpm ds:verify-interact         # 다른 터미널. 일부만: -- Checkbox,Modal
 */
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.log("playwright 가 없어 상호작용 검증을 건너뜁니다.");
  console.log("  pnpm add -D playwright && pnpm exec playwright install chromium");
  process.exit(0);
}

const BASE = process.env.SB_URL ?? "http://localhost:6006";
const only = process.argv[2] ? process.argv[2].split(",") : null;
let index;
try {
  index = await (await fetch(`${BASE}/index.json`)).json();
} catch {
  console.log(`Storybook(${BASE}) 에 연결할 수 없습니다. 먼저 pnpm storybook 을 띄우세요.`);
  process.exit(1);
}
const firstStory = {};
const storyIds = {};
// 사이드바에 없는 회귀 검사용 story(`Tests/…`)도 이름으로 연다.
for (const e of Object.values(index.entries)) {
  if (e.type === "story" && e.title.startsWith("Tests/")) (storyIds[e.title.slice("Tests/".length)] ??= {})[e.name] = e.id;
}
for (const e of Object.values(index.entries)) {
  if (e.type !== "story" || !e.title.startsWith("Components/")) continue;
  const c = e.title.split("/").pop();
  firstStory[c] ??= e.id;
  (storyIds[c] ??= {})[e.name] = e.id;
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1000, height: 800 }, permissions: ["clipboard-read", "clipboard-write"] });
const results = [];
let errors = [];

async function open(page, comp, story) {
  const id = story ? storyIds[comp]?.[story] : firstStory[comp];
  if (!id) throw new Error(`story 없음: ${comp}/${story ?? "(first)"}`);
  errors = [];
  // 동작 검사는 한국어 접근 이름(지우기·닫기 …)으로 찾는다. 기본 언어가 영어라 한국어를 명시한다.
  // 영어 화면은 아래 "EN 번역 누락"·"EN 전환 후 컴포넌트 문구" 검사가 따로 본다.
  await page.goto(`${BASE}/iframe.html?id=${id}&viewMode=story&globals=locale:ko`, { waitUntil: "networkidle" });
  await page.waitForSelector("#storybook-root *", { state: "attached", timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(150);
}

const T = {};
const test = (name, fn) => (T[name] = fn);
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };

test("Checkbox", async (p) => {
  await open(p, "Checkbox");
  const box = p.locator("[data-testid=ds-checkbox] input");
  ok((await box.getAttribute("type")) === "checkbox", `type=${await box.getAttribute("type")}`);
  const text = (await p.locator("[data-testid=ds-checkbox]").innerText()).trim();
  ok(text.length > 0, "라벨 글자가 보이지 않음");
  await p.locator("[data-testid=ds-checkbox] label").click();
  ok(await box.isChecked(), "라벨을 눌러도 체크되지 않음");
  await box.click();
  ok(!(await box.isChecked()), "다시 눌러도 해제되지 않음");
  await open(p, "Checkbox", "Indeterminate");
  ok(await p.locator("[data-testid=ds-checkbox] input").evaluate((n) => n.indeterminate), "indeterminate 가 input 에 반영되지 않음");
});

test("RadioButton", async (p) => {
  await open(p, "RadioButton");
  const radios = p.getByRole("radio");
  ok((await radios.count()) >= 2, `radio ${await radios.count()}개`);
  await p.getByText(await radios.nth(1).evaluate((n) => n.labels?.[0]?.textContent ?? "")).click();
  ok(await radios.nth(1).isChecked(), "두 번째 항목을 눌러도 선택되지 않음");
  ok(!(await radios.nth(0).isChecked()), "첫 항목이 해제되지 않음");
});

test("Toggle", async (p) => {
  await open(p, "Toggle");
  const sw = p.getByRole("switch");
  ok((await sw.count()) === 1, "role=switch 없음");
  const before = await sw.getAttribute("aria-checked");
  await sw.click();
  const after = await sw.getAttribute("aria-checked");
  ok(before === "false" && after === "true", `aria-checked ${before} → ${after}`);
  ok((await sw.innerText()).trim().length > 0, "라벨 없음");
});

for (const [comp, tag] of [["TextInput", "input"], ["Textarea", "textarea"]]) {
  test(comp, async (p) => {
    await open(p, comp);
    const label = p.locator(`[data-testid=ds-${comp.toLowerCase()}] label`);
    ok((await label.count()) === 1 && (await label.innerText()).trim(), "라벨 없음");
    await label.click();
    const field = p.locator(`[data-testid=ds-${comp.toLowerCase()}] ${tag}`);
    ok(await field.evaluate((n) => n === document.activeElement), "라벨을 눌러도 입력칸에 포커스가 가지 않음");
    await p.keyboard.type("hello");
    ok((await field.inputValue()) === "hello", "입력이 되지 않음");
  });
}

test("Select", async (p) => {
  await open(p, "Select");
  const sel = p.locator("[data-testid=ds-select] select");
  const n = await sel.locator("option").count();
  ok(n >= 2, `option ${n}개`);
  const v = await sel.locator("option").nth(n - 1).getAttribute("value");
  await sel.selectOption(v);
  ok((await sel.inputValue()) === v, "선택이 반영되지 않음");
  ok((await p.locator("[data-testid=ds-select] label").count()) === 1, "라벨 없음");
});

test("Search", async (p) => {
  await open(p, "Search");
  const box = p.getByRole("searchbox");
  ok((await box.count()) === 1, "searchbox 없음");
  ok(await box.getAttribute("aria-label") || await box.getAttribute("aria-labelledby") || (await box.evaluate((n) => n.labels?.length)), "접근 이름 없음");
  await box.fill("token");
  const clear = p.getByRole("button", { name: /지우기/ });
  ok((await clear.count()) === 1, "지우기 버튼 없음");
  await clear.click();
  ok((await box.inputValue()) === "", "지우기가 동작하지 않음");
  ok(await box.evaluate((n) => n === document.activeElement), "지운 뒤 입력칸으로 포커스가 돌아오지 않음");
});

test("NumberInput", async (p) => {
  await open(p, "NumberInput");
  const field = p.locator("[data-testid=ds-numberinput] input");
  const start = Number(await field.inputValue());
  await p.getByRole("button", { name: /늘리기/ }).click();
  ok(Number(await field.inputValue()) === start + 1, "증가 버튼이 동작하지 않음");
  await field.fill("");
  await field.type("15");
  await field.blur();
  ok((await field.inputValue()) === "15", `타이핑 값이 유지되지 않음: ${await field.inputValue()}`);
});

test("Slider", async (p) => {
  await open(p, "Slider");
  const range = p.locator("[data-testid=ds-slider] input[type=range]");
  const v0 = Number(await range.inputValue());
  await range.focus();
  await p.keyboard.press("ArrowRight");
  ok(Number(await range.inputValue()) === v0 + 1, "→ 키로 증가하지 않음");
  const num = p.locator("[data-testid=ds-slider] input[type=number]");
  await num.fill("");
  await num.type("42");
  await num.press("Enter");
  ok(Number(await range.inputValue()) === 42, `숫자 입력이 range 에 반영되지 않음: ${await range.inputValue()}`);
});

test("Dropdown", async (p) => {
  await open(p, "Dropdown");
  const trigger = p.getByRole("combobox");
  await trigger.click();
  ok(await p.getByRole("listbox").isVisible(), "눌러도 목록이 열리지 않음");
  await p.getByRole("option").nth(1).click();
  ok(!(await p.getByRole("listbox").isVisible()), "선택 후 닫히지 않음");
  const picked = (await trigger.innerText()).trim();
  ok(picked && picked !== "선택하세요", "선택값이 트리거에 표시되지 않음");
  // 키보드: Space 로 열고 ↓ Space 로 고른 뒤 닫혀야 한다.
  await trigger.focus();
  await p.keyboard.press("Space");
  ok(await p.getByRole("listbox").isVisible(), "Space 로 열리지 않음");
  await p.keyboard.press("ArrowDown");
  await p.keyboard.press("Space");
  ok(!(await p.getByRole("listbox").isVisible()), "Space 로 고른 뒤 목록이 다시 열려 있음");
  await p.keyboard.press("Enter");
  ok(await p.getByRole("listbox").isVisible(), "Enter 로 열리지 않음");
  await p.keyboard.press("Enter");
  ok(!(await p.getByRole("listbox").isVisible()), "Enter 로 고른 뒤 목록이 다시 열려 있음");
});

test("ComboBox", async (p) => {
  await open(p, "ComboBox");
  const input = p.getByRole("combobox");
  await input.click();
  const all = await p.getByRole("option").count();
  const firstLabel = (await p.getByRole("option").first().innerText()).trim();
  await input.fill(firstLabel.slice(0, 3));
  const filtered = await p.getByRole("option").count();
  ok(filtered >= 1 && filtered <= all, "필터링되지 않음");
  await p.keyboard.press("ArrowDown");
  await p.keyboard.press("Enter");
  ok((await input.inputValue()).length > 0, "Enter 로 선택되지 않음");
  await p.mouse.click(5, 5);
  await input.focus();
  ok(await p.getByRole("listbox").isVisible(), "포커스 시 열리지 않음");
  await p.keyboard.press("Tab");
  ok(!(await p.getByRole("listbox").isVisible()), "Tab 으로 벗어나도 목록이 열려 있음");
});

test("MultiSelect", async (p) => {
  await open(p, "MultiSelect");
  const trigger = p.getByRole("combobox");
  await trigger.focus();
  await p.keyboard.press("Space");
  ok(await p.getByRole("listbox").isVisible(), "Space 로 열리지 않음");
  const before = await p.locator("[role=option][aria-selected=true]").count();
  await p.keyboard.press("ArrowDown");
  await p.keyboard.press("Space");
  ok(await p.getByRole("listbox").isVisible(), "Space 로 고른 뒤 목록이 닫힘");
  const after = await p.locator("[role=option][aria-selected=true]").count();
  ok(after !== before, "Space 로 선택이 바뀌지 않음");
  ok(await trigger.getAttribute("aria-activedescendant"), "aria-activedescendant 없음");
  await p.keyboard.press("Escape");
  ok(!(await p.getByRole("listbox").isVisible()), "Esc 로 닫히지 않음");
});

test("DatePicker", async (p) => {
  await open(p, "DatePicker");
  const input = p.locator("[data-testid=ds-datepicker] input");
  const v0 = await input.inputValue();
  await p.getByRole("button", { name: "달력 열기" }).click();
  const next = p.getByRole("button", { name: "다음 달" });
  await next.focus();
  await p.keyboard.press("Enter");
  await p.keyboard.press("Enter");
  ok((await input.inputValue()) === v0, `다음 달 버튼에서 Enter 두 번에 날짜가 선택됨: ${await input.inputValue()}`);
  ok(await next.evaluate((n) => n === document.activeElement), "다음 달 버튼에서 포커스가 벗어남");
  await p.keyboard.press("Escape");
  ok(!(await p.locator("[data-testid=ds-datepicker] .ds-datepicker__panel").isVisible()), "Esc 로 달력이 닫히지 않음");
  await p.getByRole("button", { name: "달력 열기" }).click();
  await p.locator(".ds-datepicker__day:not([data-outside])").nth(14).click();
  ok((await input.inputValue()) !== v0, "날짜를 눌러도 값이 바뀌지 않음");
});

test("DatePicker range", async (p) => {
  await open(p, "DatePicker", "Range");
  const input = p.locator("[data-testid=ds-datepicker] input");
  await input.fill("");
  await p.getByRole("button", { name: "달력 열기" }).click();
  const days = p.locator(".ds-datepicker__day:not([data-outside])");
  await days.nth(19).click();
  await days.nth(9).click();
  const [a, b] = (await input.inputValue()).split("/");
  ok(a && b && a < b, `범위 순서가 뒤집힘: ${await input.inputValue()}`);
});

test("TimePicker", async (p) => {
  await open(p, "TimePicker");
  const hour = p.getByRole("combobox", { name: "시" });
  await hour.selectOption("3");
  ok((await hour.inputValue()) === "3", "시 선택이 반영되지 않음");
});

test("Modal", async (p) => {
  await open(p, "Modal");
  const dialog = p.getByRole("dialog");
  ok(await dialog.isVisible(), "Default story 에서 열려 있지 않음");
  await p.keyboard.press("Escape");
  ok(!(await dialog.isVisible()), "Esc 로 닫히지 않음");
  const trigger = p.locator(".ds-modal__trigger");
  ok((await trigger.count()) >= 1, "다시 여는 트리거 없음");
  await trigger.first().click();
  ok(await dialog.isVisible(), "트리거로 열리지 않음");
  await p.getByRole("button", { name: "닫기" }).click();
  ok(!(await dialog.isVisible()), "닫기 버튼이 동작하지 않음");
  ok(await trigger.first().evaluate((n) => n === document.activeElement), "닫은 뒤 트리거로 포커스가 돌아오지 않음");
});

// 부모가 상태를 들고 콜백을 인라인으로 넘기면 입력마다 새 콜백이 내려온다.
// 오버레이의 포커스 effect 가 콜백에 의존하면 한 글자마다 포커스가 튄다.
for (const [story, label] of [["Modal Inline On Close", "새 이름"], ["Popover Inline On Open Change", "검색어"]]) {
  test(`포커스 유지 · ${story.split(" ")[0]}`, async (p) => {
    await open(p, "포커스 유지", story);
    const input = p.getByLabel(label);
    await input.click();
    await p.keyboard.type("abc");
    ok((await input.inputValue()) === "abc", `입력 도중 포커스가 튐: 값="${await input.inputValue()}"`);
    ok(await input.evaluate((n) => n === document.activeElement), "입력칸에서 포커스가 빠져나감");
  });
}

test("Popover", async (p) => {
  await open(p, "Popover");
  const btn = p.locator("[data-testid=ds-popover] button").first();
  await btn.click();
  ok(await btn.getAttribute("aria-expanded") === "true", "열리지 않음");
  await p.keyboard.press("Escape");
  ok(await btn.getAttribute("aria-expanded") === "false", "Esc 로 닫히지 않음");
});

test("Toggletip", async (p) => {
  await open(p, "Toggletip");
  const btn = p.locator("[data-testid=ds-toggletip] button");
  await btn.click();
  ok(await btn.getAttribute("aria-expanded") === "true", "열리지 않음");
});

test("Tooltip", async (p) => {
  await open(p, "Tooltip");
  await p.locator("[data-testid=ds-tooltip]").hover();
  ok(await p.getByRole("tooltip").isVisible(), "hover 로 보이지 않음");
});

test("OverflowMenu", async (p) => {
  await open(p, "OverflowMenu");
  const btn = p.locator("[data-testid=ds-overflowmenu] > button");
  await btn.click();
  ok(await p.getByRole("menu").isVisible(), "메뉴가 열리지 않음");
  await p.keyboard.press("ArrowDown");
  await p.keyboard.press("Escape");
  ok(!(await p.getByRole("menu").isVisible()), "Esc 로 닫히지 않음");
});

test("Tabs", async (p) => {
  await open(p, "Tabs");
  const tabs = p.getByRole("tab");
  await tabs.nth(1).click();
  ok(await tabs.nth(1).getAttribute("aria-selected") === "true", "탭이 선택되지 않음");
  await p.keyboard.press("ArrowRight");
  ok(await tabs.nth(2).getAttribute("aria-selected") === "true", "→ 로 이동하지 않음");
});

test("Accordion", async (p) => {
  await open(p, "Accordion");
  const h = p.locator(".ds-accordion__trigger").first();
  const before = await h.getAttribute("aria-expanded");
  await h.click();
  ok(before !== await h.getAttribute("aria-expanded"), "펼쳐지지 않음");
});

test("ContentSwitcher", async (p) => {
  await open(p, "ContentSwitcher");
  const r = p.getByRole("radio");
  await r.nth(1).click();
  ok(await r.nth(1).getAttribute("aria-checked") === "true", "전환되지 않음");
});

test("Pagination", async (p) => {
  await open(p, "Pagination");
  const cur = async () => (await p.locator("[aria-current=page]").innerText()).trim();
  const c0 = await cur();
  await p.getByRole("button", { name: "다음 페이지" }).click();
  ok((await cur()) === String(Number(c0) + 1), `다음 페이지가 동작하지 않음 (${c0} → ${await cur()})`);
});

test("TreeView", async (p) => {
  await open(p, "TreeView");
  const collapsed = p.locator("[role=treeitem][aria-expanded=false]").first();
  const label = (await collapsed.innerText()).trim();
  await collapsed.click();
  ok(await p.getByRole("treeitem", { name: label }).getAttribute("aria-expanded") === "true", "마우스로 가지를 펼칠 수 없음");
});

test("Tag", async (p) => {
  await open(p, "Tag", "Dismissible");
  const btn = p.getByRole("button", { name: /제거/ });
  ok((await btn.count()) === 1, "제거 버튼 없음");
  await btn.click();
  ok((await p.locator("[data-testid=ds-tag]").count()) === 0, "눌러도 사라지지 않음");
});

test("Notification", async (p) => {
  await open(p, "Notification", "Dismissible");
  await p.getByRole("button", { name: /닫기/ }).click();
  ok((await p.locator("[data-testid=ds-notification]").count()) === 0, "닫기를 눌러도 사라지지 않음");
});

test("Tile", async (p) => {
  await open(p, "Tile", "Selectable");
  const t = p.getByRole("checkbox");
  ok((await t.count()) === 1, "selectable 에 role=checkbox 없음");
  await t.click();
  ok(await t.getAttribute("aria-checked") === "true", "눌러도 선택되지 않음");
  await t.focus();
  await p.keyboard.press("Space");
  ok(await t.getAttribute("aria-checked") === "false", "Space 로 해제되지 않음");
  await open(p, "Tile", "Expandable");
  const b = p.locator("[data-testid=ds-tile] [aria-expanded]");
  ok((await b.count()) === 1, "expandable 에 aria-expanded 버튼 없음");
  await b.click();
  ok(await b.getAttribute("aria-expanded") === "true", "펼쳐지지 않음");
  await open(p, "Tile", "Clickable");
  ok((await p.locator("[data-testid=ds-tile]").evaluate((n) => n.tagName === "A" || n.tagName === "BUTTON" || n.getAttribute("role") === "button")), "clickable 이 상호작용 요소가 아님");
});

test("FileUploader", async (p) => {
  // 한 개만 받는 경우: 새로 고르면 바뀐다.
  await open(p, "FileUploader");
  await p.locator("[data-testid=ds-fileuploader] input[type=file]").setInputFiles({ name: "b.json", mimeType: "application/json", buffer: Buffer.from("{}") });
  ok((await p.locator(".ds-fileuploader__name").allInnerTexts()).join() === "b.json", "한 개만 받는데 새 파일로 바뀌지 않음");
  // 여러 개 받는 경우: 뒤에 붙는다.
  await open(p, "FileUploader", "Multiple");
  const n0 = await p.locator(".ds-fileuploader__file").count();
  await p.locator("[data-testid=ds-fileuploader] input[type=file]").setInputFiles({ name: "a.json", mimeType: "application/json", buffer: Buffer.from("{}") });
  ok((await p.locator(".ds-fileuploader__file").count()) === n0 + 1, "파일을 골라도 목록에 추가되지 않음");
  await p.getByRole("button", { name: "a.json 제거" }).click();
  ok((await p.locator(".ds-fileuploader__file").count()) === n0, "제거가 동작하지 않음");
});

test("CodeSnippet", async (p) => {
  await open(p, "CodeSnippet");
  await p.getByRole("button", { name: "코드 복사" }).click();
  await p.waitForTimeout(100);
  ok((await p.getByRole("status").innerText()).includes("복사했습니다"), "복사 결과가 안내되지 않음");
});

test("Link", async (p) => {
  await open(p, "Link");
  const a = p.locator("[data-testid=ds-link]");
  ok(await a.getAttribute("href"), "href 없음 — 링크로 동작하지 않음");
  const bg = await a.evaluate((n) => getComputedStyle(n).backgroundColor);
  ok(bg === "rgba(0, 0, 0, 0)" || bg === "transparent", `링크에 버튼 배경이 칠해짐: ${bg}`);
  await open(p, "Link", "Disabled");
  ok(!(await p.locator("[data-testid=ds-link]").getAttribute("href")), "disabled 인데 href 가 남아 이동됨");
  await open(p, "Link", "External");
  const ext = p.locator("[data-testid=ds-link]");
  ok((await ext.getAttribute("target")) === "_blank" && /noopener/.test(await ext.getAttribute("rel") ?? ""), "external 에 target/rel 없음");
});

test("IconButton", async (p) => {
  await open(p, "IconButton");
  const b = p.locator("[data-testid=ds-iconbutton]");
  ok(await b.getAttribute("aria-label"), "aria-label 없음");
  ok((await b.locator("svg").count()) === 1, "아이콘 없음");
});

test("Loading", async (p) => {
  await open(p, "Loading");
  ok((await p.getByRole("status").count()) >= 1, "role=status 없음");
  ok((await p.locator("[data-testid=ds-loading] svg").count()) === 1, "스피너 없음");
});

test("InlineLoading", async (p) => {
  await open(p, "InlineLoading");
  const text = (await p.locator("[data-testid=ds-inlineloading]").innerText()).trim();
  ok(text.length > 0, "description 이 보이지 않음");
  ok((await p.locator("[data-testid=ds-inlineloading] svg").count()) === 1, "상태 아이콘 없음");
});

test("Skeleton", async (p) => {
  await open(p, "Skeleton");
  const s = p.locator("[data-testid=ds-skeleton]");
  ok(!(await s.innerText()).trim(), "스켈레톤에 글자가 보임");
  const box = await s.boundingBox();
  ok(box && box.width > 40 && box.height > 4, `스켈레톤 크기 이상: ${JSON.stringify(box)}`);
});

test("StructuredList", async (p) => {
  await open(p, "StructuredList", "Selectable");
  await p.getByRole("radio").nth(1).check();
  ok(await p.getByRole("radio").nth(1).isChecked(), "행 선택이 되지 않음");
});

test("Card", async (p) => {
  await open(p, "Card");
  const c = p.locator("[data-testid=ds-card]");
  const edge = await c.evaluate((n) => { const s = getComputedStyle(n); return { color: s.borderTopColor, width: s.borderTopWidth, shadow: s.boxShadow }; });
  ok((edge.width !== "0px" && edge.color !== "rgba(0, 0, 0, 0)") || edge.shadow !== "none", `카드 경계가 보이지 않음: ${JSON.stringify(edge)}`);
});

test("Button", async (p) => {
  await open(p, "Button");
  ok((await p.locator("[data-testid=ds-button]").getAttribute("type")) === "button", "type=button 기본값 없음 (form 안에서 submit 됨)");
});

// ── 언어 전환(EN) ────────────────────────────────────────────────────
// 헤더에서 EN 을 고르면 보이는 곳에 한글이 남으면 안 된다. 모든 컴포넌트 story 와 문서를
// `globals=locale:en` 으로 열어, 보이는 글자와 접근 이름(aria-label·placeholder·title)을 본다.
// lang="ko" 로 표시한 원문(Figma 설명)은 번역 대상이 아니다.
async function hangulOnPage(p) {
  return p.evaluate(() => {
    const HANGUL = /[\u3131-\u318E\uAC00-\uD7A3]/;
    const skip = (el) => !el || el.closest('[lang="ko"]:not(html), script, style, noscript') || !el.checkVisibility({ checkVisibilityCSS: true });
    const found = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (HANGUL.test(n.textContent ?? "") && !skip(n.parentElement)) found.push(n.textContent.trim().slice(0, 40));
    }
    for (const el of document.body.querySelectorAll("[aria-label], [placeholder], [title]")) {
      for (const attr of ["aria-label", "placeholder", "title"]) {
        const v = el.getAttribute(attr);
        if (v && HANGUL.test(v) && !el.closest('[lang="ko"]:not(html)')) found.push(`@${attr}=${v.slice(0, 30)}`);
      }
    }
    return [...new Set(found)];
  });
}

const enTargets = Object.values(index.entries).filter((e) =>
  e.type === "story" && !e.title.startsWith("Tests/"));

test("EN 번역 누락", async (p) => {
  const bad = [];
  for (const e of enTargets) {
    const mode = e.type === "docs" ? "docs" : "story";
    await p.goto(`${BASE}/iframe.html?id=${e.id}&viewMode=${mode}&globals=locale:en`, { waitUntil: "networkidle" });
    await p.waitForTimeout(150);
    const found = await hangulOnPage(p);
    if (found.length) bad.push(`${e.title}/${e.name}: ${found.slice(0, 3).join(" | ")}`);
  }
  errors = [];
  ok(!bad.length, `${bad.length}곳에 한글이 남음 — ${bad.slice(0, 4).join(" ;; ")}`);
});

test("EN 전환 후 컴포넌트 문구", async (p) => {
  const go = (id) => p.goto(`${BASE}/iframe.html?id=${id}&viewMode=story&globals=locale:en`, { waitUntil: "networkidle" });
  await go(firstStory.Search);
  await p.getByRole("searchbox").fill("token");
  ok((await p.getByRole("button", { name: "Clear search" }).count()) === 1, "Search 지우기 버튼이 영어가 아님");
  await go(firstStory.DatePicker);
  await p.getByRole("button", { name: "Open calendar" }).click();
  ok(/\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}\b/.test(await p.locator(".ds-datepicker__month").innerText()), "달력 제목이 영어가 아님");
  await go(firstStory.Pagination);
  ok((await p.getByRole("button", { name: "Next page" }).count()) === 1, "Pagination 버튼이 영어가 아님");
});

const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
for (const [name, fn] of Object.entries(T)) {
  if (only && !only.some((o) => name.startsWith(o))) continue;
  try {
    await fn(page);
    if (errors.length) throw new Error(`콘솔 오류: ${errors[0].slice(0, 200)}`);
    results.push([name, "PASS", ""]);
  } catch (e) {
    results.push([name, "FAIL", String(e.message).split("\n")[0].slice(0, 200)]);
  }
}
await browser.close();
for (const [n, s, m] of results) console.log(`${s === "PASS" ? "✔" : "✘"} ${n.padEnd(18)} ${m}`);
const fails = results.filter((r) => r[1] === "FAIL").length;
console.log(`\n${results.length - fails}/${results.length} 통과`);
process.exitCode = fails ? 1 : 0;
