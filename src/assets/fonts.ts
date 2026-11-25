/**
 * my-assets/typo 의 글꼴 파일을 Storybook 과 웹사이트에 등록한다. 두 곳 모두 이 함수 하나로 등록하므로
 * 같은 글꼴 토큰(--font-sans, --font-type-*)이 같은 글꼴 파일로 보인다.
 * 파일 이름(Family-Weight)으로 글꼴 이름·굵기·기울임을 읽는다 — scripts/lib/assets.mjs 의 parseFontFile 과 같은 규칙.
 * `pnpm assets` 가 파일 안의 글꼴 이름(Figma 와 같은 이름)으로 파일 이름을 정리해 둔다. 이름의 `_` 는 공백이다.
 */

export interface FontFile {
  file: string;
  family: string;
  weight: number | string;
  style: "normal" | "italic";
  variable: boolean;
  url: string;
}

export type FontStatus = "loading" | "loaded" | "error";

const urls = import.meta.glob("../../my-assets/typo/*.{woff2,woff,ttf,otf}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const WEIGHTS: Record<string, number> = {
  thin: 100, hairline: 100, extralight: 200, ultralight: 200, light: 300,
  regular: 400, normal: 400, book: 400, medium: 500, semibold: 600, demibold: 600,
  bold: 700, extrabold: 800, ultrabold: 800, black: 900, heavy: 900,
};

export function parseFontFile(file: string): Omit<FontFile, "url"> | null {
  const ext = file.match(/\.(woff2|woff|ttf|otf)$/i);
  if (!ext) return null;
  let parts = file.slice(0, -ext[0].length).split(/[-_ ]+/).filter(Boolean);
  let style: FontFile["style"] = "normal";
  let weight = 400;
  let variable = false;
  // Google Fonts 의 "Inter-VariableFont_opsz,wght.ttf": VariableFont 뒤는 축 이름이다.
  const vf = parts.findIndex((p, i) => i > 0 && /^variablefont$/i.test(p));
  if (vf > 0) {
    variable = true;
    parts = parts.slice(0, vf);
  }
  let family = parts;
  if (parts.length > 1) {
    let tail = (parts[parts.length - 1] ?? "").toLowerCase();
    if (tail.endsWith("italic")) {
      style = "italic";
      tail = tail.slice(0, -"italic".length);
    }
    if (tail === "variable" || tail === "vf") {
      variable = true;
      family = parts.slice(0, -1);
    } else if (tail in WEIGHTS) {
      weight = WEIGHTS[tail] ?? 400;
      family = parts.slice(0, -1);
    } else if (/^[1-9]\d\d$/.test(tail)) {
      weight = Number(tail);
      family = parts.slice(0, -1);
    } else if (tail === "") family = parts.slice(0, -1);
  }
  return { file, family: family.join(" "), weight: variable ? "100 900" : weight, style, variable };
}

/** my-assets/typo 에 있는 글꼴 파일. 글꼴 이름·굵기 순. */
export const fontFiles: FontFile[] = Object.entries(urls)
  .map(([path, url]) => {
    const parsed = parseFontFile(path.split("/").pop() ?? "");
    return parsed ? { ...parsed, url } : null;
  })
  .filter((font): font is FontFile => font !== null)
  .sort((a, b) => a.family.localeCompare(b.family) || String(a.weight).localeCompare(String(b.weight)) || a.style.localeCompare(b.style));

/** 글꼴 이름 비교용: "Noto Sans KR" 과 "NotoSansKR" 을 같은 글꼴로 본다. */
export const fontKey = (family: string) => family.toLowerCase().replace(/[^a-z0-9]/g, "");

/** my-assets/typo 에 이 글꼴 이름의 파일이 있는가. */
export const hasFontFile = (family: string) => fontFiles.some((f) => fontKey(f.family) === fontKey(family));

let registered = false;
const faces = new Map<string, FontFace>();

/**
 * 글꼴을 문서에 등록한다. 여러 번 불러도 한 번만 등록한다.
 * preload: 바로 내려받는다. Storybook 은 Typography 페이지가 불러오기 결과를 보여 줘야 해서 켠다.
 * 웹사이트는 끈다 — 브라우저가 실제로 쓰는 글꼴만 내려받아, 쓰지 않는 글꼴로 방문자 데이터를 쓰지 않는다.
 */
export function registerFonts({ preload = true }: { preload?: boolean } = {}) {
  if (registered || typeof document === "undefined" || typeof FontFace === "undefined") return;
  registered = true;
  for (const font of fontFiles) {
    const face = new FontFace(font.family, `url(${JSON.stringify(font.url)})`, { weight: String(font.weight), style: font.style, display: "swap" });
    faces.set(font.file, face);
    document.fonts.add(face);
    if (preload) face.load().catch(() => {
      // 깨진 파일은 Foundation → Typography 에서 "Couldn't load" 로 보인다(fontStatus).
    });
  }
}

/** 등록한 글꼴 파일을 실제로 불러왔는지. Foundation → Typography 가 보여 준다. */
export async function fontStatus(file: string): Promise<FontStatus> {
  registerFonts();
  const face = faces.get(file);
  if (!face) return "error";
  try {
    await face.loaded;
    return "loaded";
  } catch {
    return "error";
  }
}
