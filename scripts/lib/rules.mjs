/**
 * `.claude/rules/` 생성 — **정책의 단일 출처에서 AI 컨텍스트를 뽑는다.**
 *
 * vibe-design-starterkit 의 `.claude/rules/` + `generate-rules.js` 에서 가져온
 * 생각인데 방향이 반대다. 거기서는 사람이 쓴 rules 를 스캔해 Storybook 으로
 * 보여준다. 여기서는 `ds.config.json` + 실제 토큰 + 가드 규칙이 원본이고
 * rules 와 Storybook 문서가 **둘 다 생성물**이다.
 *
 * 그래야 AI 가 읽는 규칙과 코드가 강제하는 규칙이 어긋나지 않는다. 손으로
 * 쓴 rules 는 토큰 이름이 바뀌는 순간 거짓말이 된다.
 */
import { cssVarFor } from "./css.mjs";
import { APPLIED_AT } from "./ownership.mjs";

const OWNER_MEAN = {
  figma: "Figma 가 이긴다. 코드에서 고쳐도 다음 동기화에 덮인다.",
  code: "코드가 이긴다. Figma 변경은 제안으로만 올라온다.",
  human: "사람이 쓴 것이 이긴다. 비어 있을 때만 채우고 절대 덮어쓰지 않는다.",
};

const OWNER_LABEL = {
  tokenValue: "토큰 값", tokenName: "토큰 이름", semanticMapping: "semantic 매핑",
  componentApi: "컴포넌트 API", variantMatrix: "variant 행렬",
  description: "설명", usageGuide: "사용 가이드",
};

const HEAD = (title, note) => `# ${title}\n\n> ${note}\n>\n> 이 파일은 \`ds.config.json\` 과 실제 토큰에서 생성됩니다. 손으로 쓴 규칙은 토큰 이름이 바뀌는 순간 거짓말이 되기 때문입니다.\n`;

export function designTokensRule(tokens, report, config) {
  const semantic = tokens.filter((t) => t.layer === "semantic");
  const layout = tokens.filter((t) => t.layer === "layout");
  const component = tokens.filter((t) => t.layer === "component");
  const cssVar = (t) => cssVarFor(t.category, t.name);

  const lines = [];
  lines.push(HEAD("디자인 토큰 (MUST)", `현재 해석: ${report.levelLabel}`));
  lines.push("## 계층");
  lines.push("");
  lines.push("`Hexcode → Primitive → Semantic`. 컴포넌트는 **semantic 과 layout 만** 참조한다.");
  lines.push("");
  lines.push("| 계층 | 쓰는 곳 | 예 |");
  lines.push("|---|---|---|");
  lines.push("| primitive | 쓰지 않는다 | `--color-blue-500: #0066FF` |");
  lines.push("| semantic | **여기만 쓴다** | `--color-primary: var(--color-blue-500)` |");
  lines.push("| layout | 간격·모서리·타이포·모션 | `--radius-md`, `--spacing` |");
  if (component.length) lines.push("| component | 해당 컴포넌트 안에서만 | `--color-button-bg` |");
  lines.push("");
  lines.push("## 금지");
  lines.push("");
  lines.push("- 색상·간격·모서리·폰트를 리터럴로 쓰지 않는다. `#fff`, `16px`, `8px` 전부 금지.");
  lines.push("- primitive 를 컴포넌트에서 직접 참조하지 않는다 (`var(--color-blue-500)` ✗).");
  lines.push("- 없는 토큰을 만들어 쓰지 않는다. 필요하면 Figma 에 추가하고 다시 읽는다.");
  lines.push("");
  lines.push("## 쓸 수 있는 semantic 토큰 (이게 전부다)");
  lines.push("");
  lines.push("```css");
  for (const t of semantic) lines.push(`${cssVar(t)}   /* ${t.ref ?? t.value} */`);
  lines.push("```");
  lines.push("");
  lines.push("## layout 토큰");
  lines.push("");
  lines.push("```css");
  for (const t of layout) lines.push(`${cssVar(t)}: ${t.value};`);
  lines.push("```");
  if (component.length) {
    lines.push("");
    lines.push("## component 토큰");
    lines.push("");
    lines.push("```css");
    for (const t of component) lines.push(`${cssVar(t)}: ${t.value};`);
    lines.push("```");
  }
  const low = tokens.filter((t) => t.confidence < (config.confidence?.review ?? 0.6));
  if (low.length) {
    lines.push("");
    lines.push("## 주의 — 추론된 토큰");
    lines.push("");
    lines.push(`아래 ${low.length}개는 사람이 선언한 값이 아니라 추론·합성된 것이다. 쓰기 전에 사용자에게 확인할 것.`);
    lines.push("");
    for (const t of low.slice(0, 20)) lines.push(`- \`${cssVar(t)}\` — ${t.source} / ${t.reason}`);
    if (low.length > 20) lines.push(`- … 외 ${low.length - 20}개`);
  }
  return `${lines.join("\n")}\n`;
}

export function componentWorkRule(specs, config, coverage) {
  const lines = [];
  lines.push(HEAD("컴포넌트 작업 (MUST)", "어떤 파일이 생성물이고 어떤 파일이 사람 것인지."));
  lines.push("## 파일 소유권");
  lines.push("");
  lines.push("| 파일 | 소유 | 고쳐도 되나 |");
  lines.push("|---|---|---|");
  lines.push("| `<Name>.tsx` / `.css` | **사람** | 고친다. 생성기가 다시 건드리지 않는다. |");
  lines.push("| `<Name>.stories.tsx` | 생성기 | 고치면 충돌로 보고되고 **보존**된다. 되도록 Figma 를 고칠 것. |");
  lines.push("| `<Name>.figma.tsx` | 생성기 | 위와 같음 |");
  lines.push("| `src/tokens/tokens.css` | 생성기 | **고치지 말 것.** 매번 전체 재작성된다. |");
  lines.push("| `src/docs/*` | 생성기 | 위와 같음 |");
  lines.push("");
  lines.push("## 새 컴포넌트를 만들기 전에");
  lines.push("");
  lines.push("1. 기존 컴포넌트로 되는지 먼저 본다. 중복 생성 금지.");
  lines.push("2. Figma 에 Component Set 이 있으면 **손으로 만들지 말고** `pnpm ds:gen` 을 돌린다.");
  lines.push("3. Figma 에 없으면 사용자에게 Figma 에 먼저 만들지 물어본다 — 코드가 먼저 생기면 동기화가 깨진다.");
  lines.push("");
  lines.push("## 규칙");
  lines.push("");
  lines.push("- 클래스는 `ds-<name>` / `ds-<name>--<variant>` 규약을 따른다.");
  lines.push("- Figma 의 `State` variant 는 prop 이 아니다. `:hover` / `:active` / `:focus-visible` / `disabled` 가 처리한다.");
  lines.push("- 모든 컴포넌트는 `data-testid=\"ds-<name>\"` 을 갖는다 (story 의 play 함수가 쓴다).");
  lines.push("- story 는 `tags: [\"autodocs\"]` 와 play 함수를 최소 하나 갖는다.");
  lines.push("");
  lines.push("## 현재 있는 컴포넌트");
  lines.push("");
  if (!specs.length) lines.push("아직 없다. Figma 를 읽으면 채워진다.");
  else {
    lines.push("| 이름 | props | variant | 설명 |");
    lines.push("|---|---|---|---|");
    for (const s of specs) {
      const props = s.props.map((p) => p.codeName).join(", ") || "—";
      lines.push(`| ${s.pascal} | ${props} | ${s.variantCount} | ${(s.description || "—").replace(/\|/g, "/").slice(0, 60)} |`);
    }
  }
  if (coverage?.unclassified?.length) {
    lines.push("");
    lines.push(`분류되지 않은 컴포넌트: ${coverage.unclassified.join(", ")} — 표준 어휘와 이름이 다르다.`);
  }
  return `${lines.join("\n")}\n`;
}

export function syncRule(config, rules, report) {
  const lines = [];
  lines.push(HEAD("동기화 정책 (MUST)", "Figma 와 코드 중 누가 이기는지, 무엇을 자동으로 만드는지."));
  lines.push("## 소유권");
  lines.push("");
  lines.push("| 필드 | 소유 | 뜻 | 적용되는 곳 |");
  lines.push("|---|---|---|---|");
  for (const [key, owner] of Object.entries(config.ownership ?? {})) {
    lines.push(`| ${OWNER_LABEL[key] ?? key} | **${owner}** | ${OWNER_MEAN[owner] ?? ""} | ${APPLIED_AT[key] ?? "생성 경로 없음"} |`);
  }
  lines.push("");
  lines.push("- 소유자가 figma 가 아닌 필드의 Figma 변경은 반영되지 않고 **제안(G16)** 으로 올라온다. 받아들이는 것은 사람이 정한다(`ds all --accept`).");
  lines.push("- semantic 매핑을 바꾸려면 `tokens.css` 가 아니라 `.ds/semantic.json` 에 `\"역할\": \"primitive 이름\"` 으로 적는다. **이 파일을 AI 가 추측으로 채우지 말 것.**");
  lines.push("");
  lines.push("## 하지 않는 것");
  lines.push("");
  lines.push("- **역방향 쓰기 금지.** 코드나 추측을 Figma 로 되돌려 쓰지 않는다. 한 번이라도 설명을 역주입하면 다음 읽기에서 자기 추측을 사람이 쓴 설명으로 오인한다.");
  lines.push("- **양방향 동기화 금지.** 한쪽이 이기고 반대쪽은 제안만 한다.");
  lines.push("- **픽셀 비교 금지.** Figma 렌더와 브라우저 렌더를 픽셀로 맞추면 폰트 래스터화 때문에 영구 false positive 가 된다. 비교는 구조·값으로 한다.");
  lines.push("");
  lines.push("## 가드 규칙");
  lines.push("");
  lines.push("`pnpm ds:guard` 가 검사한다. 어기는 코드를 쓰지 말 것.");
  lines.push("");
  lines.push("| | 규칙 | 심각도 |");
  lines.push("|---|---|---|");
  for (const r of rules) lines.push(`| ${r.id} | ${r.title} | ${r.severity === "error" ? "오류" : "경고"} |`);
  lines.push("");
  lines.push(`현재 해석 계층: **${report.level}** — ${report.levelLabel}`);
  return `${lines.join("\n")}\n`;
}
