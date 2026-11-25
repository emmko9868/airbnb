/* @ds-generated 2b3541f545540818 — `pnpm ds:gen` 이 만든 파일입니다.
   Foundation — .ds/foundation.json 을 읽는 화면
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
/**
 * Foundation 화면의 데이터. `pnpm ds:tokens` 가 쓰는 .ds/foundation.json 을 실행 중에 읽는다.
 * 파일이 바뀌면 Storybook 이 바로 다시 그린다 — `pnpm ds:docs` 를 돌릴 필요가 없다.
 */

export type M = { ko: string; en: string; missing?: boolean };
export type Token = {
  layer: string;
  category: string;
  name: string;
  cssVar: string;
  value: string;
  hex: string | null;
  ref: string | null;
  source: string;
  confidence: number;
  reason: M;
  typeScale?: string;
};
export type FigmaRow = { figma: string; tier: string; token: string | null; applied: boolean; how: M; hint: M | null };
export type FoundationData = {
  schema: number;
  level: string;
  levelLabel: M;
  notes: M[];
  counts: Record<string, number>;
  bySource: Record<string, number>;
  reviewThreshold: number;
  review: { name: string; layer: string; confidence: number; reason: M }[];
  studentPalette: boolean;
  missingRoles: string[];
  figma: null | { fileKey: string; importedAt: string | null; variables: FigmaRow[]; families: string[] };
  tokens: Token[];
};

// 파일이 없어도(처음 받은 직후) 화면이 깨지지 않게 glob 으로 읽는다.
const files = import.meta.glob("../../../.ds/foundation.json", { eager: true, import: "default" }) as Record<string, FoundationData>;
export const DATA: FoundationData | null = Object.values(files)[0] ?? null;
export const TOKENS: Token[] = DATA?.tokens ?? [];

export const tokensOf = (layer: string, category?: string) =>
  TOKENS.filter((t) => t.layer === layer && (category === undefined || t.category === category));
export const findColor = (name: string | null) => (name ? TOKENS.find((t) => t.category === "COLOR" && t.name === name) ?? null : null);

export type Pair = [string, string];

/** 스타터 부품이 쓰는 색 역할 16개를 쓰임새별로 묶는다. */
export const ROLE_GROUPS: { title: Pair; roles: string[] }[] = [
  { title: ["바탕과 표면", "Background and surface"], roles: ["bg", "surface", "surface-raised"] },
  { title: ["글자", "Text"], roles: ["text", "text-secondary", "text-disabled"] },
  { title: ["테두리", "Border"], roles: ["border", "border-strong"] },
  { title: ["주 색 (중요한 동작)", "Primary (main action)"], roles: ["primary", "primary-hover", "primary-active", "on-primary"] },
  { title: ["상태", "Status"], roles: ["danger", "warning", "success", "info"] },
];
export const STANDARD_ROLES = ROLE_GROUPS.flatMap((g) => g.roles);

export const ROLE_LABEL: Record<string, Pair> = {
  bg: ["화면 바탕", "Page background"],
  surface: ["카드 같은 표면", "Card surface"],
  "surface-raised": ["떠 있는 표면", "Raised surface"],
  text: ["기본 글자", "Main text"],
  "text-secondary": ["보조 글자", "Secondary text"],
  "text-disabled": ["못 쓰는 글자", "Disabled text"],
  border: ["테두리", "Border"],
  "border-strong": ["진한 테두리", "Strong border"],
  primary: ["주 색", "Main color"],
  "primary-hover": ["주 색 · 마우스 올림", "Main · hover"],
  "primary-active": ["주 색 · 누름", "Main · pressed"],
  "on-primary": ["주 색 위의 글자", "Text on main color"],
  danger: ["위험 · 오류", "Danger / error"],
  warning: ["주의", "Warning"],
  success: ["성공", "Success"],
  info: ["정보", "Information"],
};

export const TIER_LABEL: Record<string, Pair> = {
  primitive: ["Primitive (색상표)", "Primitive (palette)"],
  semantic: ["Semantic (역할)", "Semantic (role)"],
  component: ["Component (부품 전용)", "Component (part-only)"],
  layout: ["Layout (간격·모서리·글자 등)", "Layout (spacing, radius, text…)"],
};

/** "blue-500" → { family: "blue", step: 500 }. 숫자 단계가 없으면 이름 자체가 한 줄이다. */
export function rampOf(name: string): { family: string; step: number | null } {
  const m = name.match(/^(.*?)[-/](\d{1,4})$/);
  return m && m[1] ? { family: m[1], step: Number(m[2]) } : { family: name, step: null };
}

/** 글자 크기 체계(Figma 텍스트 스타일)를 스타일 이름별로 묶는다. */
export function typeScale() {
  const styles = new Map<string, Record<string, Token>>();
  for (const t of TOKENS.filter((x) => x.typeScale)) {
    const slug = t.typeScale ?? "";
    const entry = styles.get(slug) ?? {};
    entry[t.category] = t;
    styles.set(slug, entry);
  }
  return [...styles.entries()].sort((a, b) => parseFloat(b[1].FONT_SIZE?.value ?? "0") - parseFloat(a[1].FONT_SIZE?.value ?? "0"));
}
