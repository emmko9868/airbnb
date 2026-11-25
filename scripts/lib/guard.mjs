/**
 * 동기화 정책 = **실행 가능한 규칙**.
 *
 * DSP `services/derivation_guard.py` 의 패턴을 따른다:
 *   - 순수 모듈(파일 IO 없음) + 규칙별 단위 테스트 + G 번호
 *   - "버리지 않고 격리": 규칙 위반이 생성을 막지 않는다. 결과물은 나오되
 *     검토 목록으로 분리된다. 오류가 있으면 명령이 실패 코드로 끝나고,
 *     `--strict` 는 경고까지 실패로 올린다.
 *
 * 규칙을 추가하면 G 번호를 붙이고 `scripts/tests/guard.test.mjs` 에 테스트를 같이 넣는다.
 */
import { contrastWarnings } from "./token-contrast.mjs";
import { parseColor, contrast } from "./color.mjs";
import { cssVarFor, requiredCssVars } from "./css.mjs";
import { validateOwnership } from "./ownership.mjs";
import { SEMANTIC_ROLES } from "./roles.mjs";

const REQUIRED_ROLES = ["bg", "text", "primary", "on-primary", "border"];

/**
 * var(--color-blue-500) → "blue-500".
 * 색 전용이다. lazy 수량자로 접두사를 벗기려 하면 `--color-` 까지 캡처에 딸려 와
 * 참조를 못 찾고 규칙이 조용히 통과해 버린다 — prefix 를 명시해 고정한다.
 */
function refNameOf(value) {
  const m = String(value ?? "").match(/var\(\s*--color-([a-z0-9-]+)/i);
  return m ? m[1] : null;
}

function refVarOf(value) {
  const m = String(value ?? "").match(/var\((--[a-z0-9-]+)/i);
  return m ? m[1] : null;
}

export const RULES = [
  {
    id: "G1",
    title: "component 토큰은 primitive 를 직접 참조하지 않는다",
    titleEn: "Component tokens do not reference primitives directly",
    severity: "error",
    run({ tokens }) {
      const primitiveVars = new Set(
        tokens.filter((t) => t.layer === "primitive").map((t) => varOf(t)),
      );
      return tokens
        .filter((t) => t.layer === "component")
        .filter((t) => {
          const ref = refVarOf(t.value);
          return ref && primitiveVars.has(ref);
        })
        .map((t) => ({ target: t.name, detail: `${t.value} 는 primitive 다. semantic/layout 을 참조해야 한다.` }));
    },
  },
  {
    id: "G2",
    title: "semantic 토큰은 alias 여야 한다 (원시 hex 금지)",
    titleEn: "Semantic tokens are aliases (no raw hex)",
    severity: "error",
    run({ tokens }) {
      return tokens
        .filter((t) => t.layer === "semantic" && t.category === "COLOR")
        .filter((t) => !String(t.value).startsWith("var("))
        .map((t) => ({ target: t.name, detail: `값이 ${t.value} 다. primitive 를 가리켜야 한다.` }));
    },
  },
  {
    id: "G3",
    title: "primitive 토큰은 원시값이어야 한다 (alias 금지)",
    titleEn: "Primitive tokens hold raw values (no aliases)",
    severity: "error",
    run({ tokens }) {
      return tokens
        .filter((t) => t.layer === "primitive")
        .filter((t) => String(t.value).startsWith("var("))
        .map((t) => ({ target: t.name, detail: `${t.value} — primitive 는 hexcode 를 직접 가져야 한다.` }));
    },
  },
  {
    id: "G4",
    title: "alias 순환 참조가 없다",
    titleEn: "No circular alias references",
    severity: "error",
    run({ tokens }) {
      const byVar = new Map(tokens.map((t) => [varOf(t), t]));
      const out = [];
      for (const t of tokens) {
        const seen = new Set();
        let cur = t;
        while (cur) {
          const key = varOf(cur);
          if (seen.has(key)) {
            out.push({ target: t.name, detail: `순환: ${[...seen].join(" → ")} → ${key}` });
            break;
          }
          seen.add(key);
          const next = refVarOf(cur.value);
          cur = next ? byVar.get(next) : null;
        }
      }
      return out;
    },
  },
  {
    id: "G5",
    title: "가리키는 토큰이 실제로 존재한다",
    titleEn: "Referenced tokens exist",
    severity: "error",
    run({ tokens }) {
      const known = new Set(tokens.map((t) => varOf(t)));
      known.add("--spacing");
      const out = [];
      for (const t of tokens) {
        for (const m of String(t.value).matchAll(/var\((--[a-z0-9-]+)/gi)) {
          if (!known.has(m[1])) out.push({ target: t.name, detail: `${m[1]} 가 정의되지 않았다.` });
        }
      }
      return out;
    },
  },
  {
    id: "G6",
    title: "신뢰도가 낮은 토큰은 사람이 검토한다",
    titleEn: "Low-confidence tokens are reviewed by a person",
    severity: "warn",
    run({ tokens, config }) {
      const threshold = config?.confidence?.review ?? 0.6;
      return tokens
        .filter((t) => (t.confidence ?? 1) < threshold)
        .map((t) => ({ target: t.name, detail: `${t.source} / ${(t.confidence ?? 0).toFixed(2)} — ${t.reason ?? ""}` }));
    },
  },
  {
    id: "G7",
    title: "필수 semantic 역할이 빠지지 않았다",
    titleEn: "No required semantic role is missing",
    severity: "error",
    run({ tokens, studentPalette }) {
      const have = new Set(tokens.filter((t) => t.layer === "semantic").map((t) => t.name));
      return (studentPalette ? SEMANTIC_ROLES : REQUIRED_ROLES).filter((r) => !have.has(r)).map((r) => ({
        target: r,
        detail: "필수 역할이 없다. primitive 에 해당 색이 없거나 추론이 실패했다.",
      }));
    },
  },
  {
    id: "G8",
    title: "on-primary 와 primary 의 대비가 4.5:1 이상이다",
    titleEn: "on-primary vs primary contrast is at least 4.5:1",
    severity: "warn",
    run({ tokens, studentPalette }) {
      if (studentPalette) return contrastWarnings(tokens);
      const hexOf = (name) => {
        const seen = new Set();
        let t = tokens.find((x) => x.layer === "semantic" && x.name === name);
        while (t && !seen.has(t.name)) {
          seen.add(t.name);
          if (t.hex) return t.hex;
          const ref = refNameOf(t.value);
          t = tokens.find((x) => x.name === ref);
        }
        return t?.hex ?? t?.value ?? null;
      };
      const a = parseColor(hexOf("on-primary"));
      const b = parseColor(hexOf("primary"));
      if (!a || !b) return [];
      const ratio = contrast(a, b);
      return ratio >= 4.5 ? [] : [{ target: "on-primary", detail: `대비 ${ratio.toFixed(2)}:1 — 본문 기준 4.5:1 미만이다.` }];
    },
  },
  {
    id: "G9",
    title: "토큰 이름은 kebab-case 다",
    titleEn: "Token names are kebab-case",
    severity: "warn",
    run({ tokens }) {
      return tokens
        .filter((t) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.name))
        .map((t) => ({ target: t.name, detail: "소문자·숫자·하이픈만 쓴다." }));
    },
  },
  {
    id: "G10",
    title: "컴포넌트 CSS 에 하드코딩된 색이 없다",
    titleEn: "No hard-coded colors in component CSS",
    severity: "error",
    run({ files }) {
      const out = [];
      for (const f of files ?? []) {
        if (!f.path.endsWith(".css")) continue;
        for (const [i, line] of f.text.split("\n").entries()) {
          if (/^\s*(\/\*|\*)/.test(line)) continue;
          const m = line.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/i);
          if (m && !/transparent|currentColor/.test(line)) {
            out.push({ target: `${f.path}:${i + 1}`, detail: `${m[0]} — 토큰(var(--…))을 써야 한다.` });
          }
        }
        // CSS 이름 색(white·black …)과 color-mix() 도 하드코딩된 색이다(Q-70 결정 3). 근사색으로 Figma 색을 흉내 내지 않는다.
        for (const hit of namedColorHits(f.text)) out.push({ target: `${f.path}:${hit.line}`, detail: `${hit.value} — 토큰을 써야 한다. Figma 색을 근사하지 않는다.` });
      }
      return out;
    },
  },
  {
    id: "G11",
    title: "컴포넌트마다 Code Connect 파일이 있다",
    titleEn: "Every component has a Code Connect file",
    severity: "warn",
    run({ components, files }) {
      const have = new Set((files ?? []).filter((f) => f.path.endsWith(".figma.tsx")).map((f) => f.path));
      return (components ?? [])
        // 기준선에서 온 컴포넌트는 Figma 노드가 없어 Code Connect 를 만들 수 없다.
        // 불가능한 것을 요구하면 경고가 무의미해진다 — Figma 에서 읽은 것만 검사한다.
        .filter((c) => c.nodeId)
        .filter((c) => ![...have].some((p) => p.includes(`/${c.pascal}.figma.tsx`)))
        .map((c) => ({ target: c.name, detail: "Code Connect 파일이 없다 — Figma↔코드 매핑의 앵커가 빠졌다." }));
    },
  },
  {
    id: "G12",
    title: "story 에 autodocs 태그와 play 함수가 있다",
    titleEn: "Stories have the autodocs tag and a play function",
    severity: "warn",
    run({ files }) {
      const out = [];
      for (const f of files ?? []) {
        if (!f.path.endsWith(".stories.tsx")) continue;
        // 따옴표 종류나 다른 태그와 섞인 경우도 같은 태그로 본다.
        if (!/\btags\s*:\s*\[[^\]]*["'`]autodocs["'`]/.test(f.text)) out.push({ target: f.path, detail: "autodocs 태그가 없다." });
        if (!/\bplay\s*[:(]/.test(f.text)) out.push({ target: f.path, detail: "play 함수가 하나도 없다." });
      }
      return out;
    },
  },
  {
    id: "G13",
    title: "컴포넌트 CSS 가 쓰는 토큰이 전부 정의돼 있다",
    titleEn: "Every token used in component CSS is defined",
    severity: "error",
    run({ tokens, files }) {
      const known = new Set(tokens.map((t) => varOf(t)));
      known.add("--spacing");
      const missing = new Map();
      for (const f of files ?? []) {
        if (!f.path.endsWith(".css")) continue;
        // var(--x, fallback) 은 정의가 없어도 동작한다 — requiredCssVars 가 뺀다.
        // ai:check 와 같게 파일 전체로 판정하고(쉼표가 다음 줄이어도), 줄 번호는 위치에서 센다.
        for (const { name, index } of requiredCssVars(f.text)) {
          if (!known.has(name) && !missing.has(name)) missing.set(name, `${f.path}:${f.text.slice(0, index).split("\n").length}`);
        }
      }
      return [...missing].map(([v, where]) => ({ target: where, detail: `${v} 가 토큰에 없다 — 렌더가 조용히 깨진다.` }));
    },
  },
  {
    id: "G14",
    title: "CSS 변수 이름이 겹치지 않는다",
    titleEn: "CSS variable names do not collide",
    severity: "error",
    run({ tokens }) {
      // 이름이 달라도 같은 변수로 나갈 수 있다(`color/primary` 와 `primary`). 겹치면
      // tokens.css 에 두 줄이 생기고 뒤의 값만 남는다 — 앞의 토큰이 조용히 사라진다.
      const seen = new Map();
      const out = [];
      for (const t of tokens) {
        const v = varOf(t);
        const prev = seen.get(v);
        if (prev) out.push({ target: v, detail: `${prev.category}:${prev.name} 와 ${t.category}:${t.name} 가 같은 변수로 나간다 — 뒤의 값만 남는다.` });
        else seen.set(v, t);
      }
      return out;
    },
  },
  {
    id: "G15",
    title: "소유권 설정과 사람 지정이 올바르다",
    titleEn: "Ownership settings and human overrides are valid",
    severity: "error",
    run({ config, ownershipIssues }) {
      // 오타(figam 등)는 조용히 기본값으로 떨어지면 안 된다. semantic.json 의 없는 primitive 지정도 여기서 잡는다.
      return [...validateOwnership(config), ...(ownershipIssues ?? [])];
    },
  },
  {
    id: "G16",
    title: "소유권 때문에 반영하지 않은 Figma 변경(제안)",
    titleEn: "Figma changes not applied because of ownership (proposals)",
    severity: "warn",
    run({ proposals }) {
      // 버리지 않고 격리 — 이긴 쪽과 다른 Figma 변경은 사람이 보고 받아들일지 정한다(--accept).
      return proposals ?? [];
    },
  },
];

/** CSS 이름 색 전체(CSS Color 4). transparent·currentColor·inherit·initial·unset 은 색 값이 아니라 뺀다. */
export const CSS_NAMED_COLORS = new Set(("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen").split(" "));

/**
 * 선언 값 안의 CSS 이름 색과 color-mix( 의 위치 [{ line, value }].
 * 값만 본다 — 속성 이름(white-space)·선택자·var(--color-white) 같은 변수 이름·문자열·url() 은 보지 않는다.
 */
export function namedColorHits(text) {
  const source = String(text ?? "").replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
  const hits = [];
  for (const block of source.matchAll(/\{([^{}]*)\}/g)) {
    let offset = block.index + 1;
    for (const declaration of block[1].split(";")) {
      const colon = declaration.indexOf(":");
      const start = offset;
      offset += declaration.length + 1;
      if (colon < 0) continue;
      const raw = declaration.slice(colon + 1);
      // 문자열·url()·var() 안의 낱말은 색이 아니다. 길이를 지키며 지운다(줄 번호를 위해).
      const value = raw.replace(/"[^"]*"|'[^']*'|url\([^)]*\)|var\([^)]*\)/gi, (part) => part.replace(/[^\n]/g, " "));
      const at = (index) => source.slice(0, start + colon + 1 + index).split("\n").length;
      for (const match of value.matchAll(/color-mix\s*\(/gi)) hits.push({ line: at(match.index), value: "color-mix()" });
      for (const match of value.matchAll(/(?<![\w-])([a-z]+)(?![\w-])/gi)) {
        if (CSS_NAMED_COLORS.has(match[1].toLowerCase())) hits.push({ line: at(match.index), value: match[1] });
      }
    }
  }
  return hits;
}

function varOf(t) {
  return cssVarFor(t.category, t.name);
}

/**
 * @returns {{ ok: boolean, errors: number, warnings: number, findings: Array }}
 */
export function runGuards(ctx, { only } = {}) {
  const findings = [];
  for (const rule of RULES) {
    if (only && !only.includes(rule.id)) continue;
    let rows = [];
    try {
      rows = rule.run(ctx) ?? [];
    } catch (error) {
      rows = [{ target: "(규칙 실행 실패)", detail: String(error?.message ?? error) }];
    }
    for (const r of rows) findings.push({ id: rule.id, title: rule.title, severity: rule.severity, ...r });
  }
  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.length - errors;
  return { ok: errors === 0, errors, warnings, findings };
}

export { REQUIRED_ROLES, SEMANTIC_ROLES };
