/**
 * 문서 페이지 공용 UI 조각. `src/docs/chrome.tsx` 로 생성된다.
 *
 * 이 파일의 색은 **토큰을 쓰지 않는다.** 토큰이 잘못 해석됐을 때도 그 사실을
 * 읽을 수 있어야 하기 때문이다. 문서는 자기가 설명하는 대상에 의존하면 안 된다.
 */
export function chromeFile() {
  return `import type { ReactNode } from "react";
import { useLocale } from "../lib/i18n";

/** 헤더(툴바)에서 고른 언어로 두 문구 중 하나를 고른다. */
export function useL() {
  const locale = useLocale();
  return <T,>(ko: T, en: T): T => (locale === "en" ? en : ko);
}

/**
 * 파이프라인 메시지({ ko, en }). 영어 규칙이 없어 옮기지 못한 문장(missing)은
 * 원문을 lang="ko" 로 보인다 — 없는 번역을 지어내지 않는다.
 */
export const Msg = ({ m }: { m: { ko: string; en: string; missing?: boolean } }) => {
  const locale = useLocale();
  if (locale !== "en") return <>{m.ko}</>;
  return m.missing ? <span lang="ko">{m.ko}</span> : <>{m.en}</>;
};

// 문서 페이지는 Storybook 검정 테마(.storybook/theme.ts)에 맞춘 어두운 색이다.
export const C = {
  fg: "#FAFAFA", dim: "#A1A1AA", faint: "#71717A",
  line: "#27272A", panel: "#111113", bg: "#000000",
  ok: "#86EFAC", okBg: "#052E16",
  warn: "#FCD34D", warnBg: "#422006",
  bad: "#FDA4AF", badBg: "#4C0519",
  info: "#93C5FD", infoBg: "#172554",
};

export const FONT = "13px/1.6 Inter, -apple-system, 'Segoe UI', sans-serif";
export const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

export const SOURCE: Record<string, { label: string; labelEn: string; bg: string; fg: string }> = {
  declared: { label: "Figma에 있음", labelEn: "In Figma", bg: C.okBg, fg: C.ok },
  extracted: { label: "색에서 찾음", labelEn: "Found in colors", bg: C.infoBg, fg: C.info },
  inferred: { label: "자동으로 고름", labelEn: "Chosen automatically", bg: C.warnBg, fg: C.warn },
  synthesized: { label: "기본값 채움", labelEn: "Default filled", bg: C.badBg, fg: C.bad },
  figma: { label: "Figma", labelEn: "Figma", bg: C.okBg, fg: C.ok },
  human: { label: "사람", labelEn: "Person", bg: C.okBg, fg: C.ok },
  "ai-inferred": { label: "AI 추측", labelEn: "AI guess", bg: C.warnBg, fg: C.warn },
  none: { label: "없음", labelEn: "None", bg: C.panel, fg: C.faint },
};

export const Shell = ({ title, desc, children }: { title: string; desc?: ReactNode; children: ReactNode }) => (
  <div lang={useLocale()} style={{ padding: 28, background: C.bg, color: C.fg, font: FONT, minHeight: "100vh" }}>
    <h2 style={{ margin: "0 0 4px", fontSize: 19, letterSpacing: "-0.01em" }}>{title}</h2>
    {desc ? <p style={{ margin: "0 0 22px", color: C.dim, maxWidth: 720 }}>{desc}</p> : null}
    {children}
  </div>
);

export const H3 = ({ children }: { children: ReactNode }) => (
  <h3 style={{ fontSize: 13, margin: "24px 0 8px", textTransform: "uppercase", letterSpacing: "0.06em", color: C.dim }}>{children}</h3>
);

export const Pill = ({ tone = "panel", children }: { tone?: "ok" | "warn" | "bad" | "info" | "panel"; children: ReactNode }) => {
  const map = {
    ok: [C.okBg, C.ok], warn: [C.warnBg, C.warn], bad: [C.badBg, C.bad],
    info: [C.infoBg, C.info], panel: [C.panel, C.dim],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <span style={{ background: bg, color: fg, borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", display: "inline-block" }}>
      {children}
    </span>
  );
};

export const SourceBadge = ({ source, confidence }: { source: string; confidence?: number }) => {
  const en = useLocale() === "en";
  const known = SOURCE[source];
  const s = known ? { ...known, label: en ? known.labelEn : known.label } : { label: source, bg: C.panel, fg: C.dim };
  return (
    <span style={{ background: s.bg, color: s.fg, borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", display: "inline-block" }}>
      {s.label}{confidence != null ? \` \${confidence.toFixed(2)}\` : ""}
    </span>
  );
};

export const Chip = ({ hex }: { hex: string | null }) => (
  <span style={{ display: "inline-block", width: 28, height: 28, borderRadius: 6, background: hex ?? "repeating-linear-gradient(45deg,#eee 0 4px,#fff 4px 8px)", border: \`1px solid \${C.line}\`, flex: "0 0 auto", verticalAlign: "middle" }} />
);

export const Table = ({ head, children, width = 960 }: { head: string[]; children: ReactNode; width?: number }) => (
  <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: width }}>
    <thead>
      <tr style={{ textAlign: "left", color: C.dim, fontSize: 11 }}>
        {head.map((h, i) => (
          <th key={i} style={{ padding: "6px 10px", borderBottom: \`1px solid \${C.line}\`, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

export const Td = ({ children, mono, dim, bold, width }: { children?: ReactNode; mono?: boolean; dim?: boolean; bold?: boolean; width?: number }) => (
  <td style={{
    padding: "6px 10px", borderBottom: \`1px solid \${C.line}\`, verticalAlign: "top",
    fontFamily: mono ? MONO : undefined, fontSize: mono ? 11 : undefined,
    color: dim ? C.dim : undefined, fontWeight: bold ? 600 : undefined, width,
  }}>{children}</td>
);

export const Note = ({ tone = "panel", children }: { tone?: "ok" | "warn" | "bad" | "info" | "panel"; children: ReactNode }) => {
  const map = { ok: [C.okBg, C.ok], warn: [C.warnBg, C.warn], bad: [C.badBg, C.bad], info: [C.infoBg, C.info], panel: [C.panel, C.dim] } as const;
  const [bg, fg] = map[tone];
  return <div style={{ background: bg, color: fg, borderRadius: 6, padding: "10px 14px", marginTop: 16, maxWidth: 820 }}>{children}</div>;
};
`;
}
