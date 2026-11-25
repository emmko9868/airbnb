import type { CSSProperties, ReactNode } from "react";
import { C, MONO } from "../chrome";

/** 반투명 색도 보이도록 바둑판 위에 칠한 색 칩. 값이 없으면 빗금. */
export function Swatch({ hex, size = 56, dashed = false }: { hex: string | null; size?: number; dashed?: boolean }) {
  const checker = "repeating-conic-gradient(#3f3f46 0% 25%, #18181b 0% 50%) 0 0 / 12px 12px";
  return (
    <span
      style={{
        display: "inline-block", width: size, height: size, borderRadius: 10, flex: "0 0 auto",
        background: hex ? `linear-gradient(${hex}, ${hex}), ${checker}` : "repeating-linear-gradient(45deg,#27272a 0 6px,#111113 6px 12px)",
        border: dashed ? `2px dashed ${C.faint}` : `1px solid ${C.line}`,
      }}
    />
  );
}

export const Code = ({ children }: { children: ReactNode }) => (
  <code style={{ fontFamily: MONO, fontSize: 12, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" }}>{children}</code>
);

export const Grid = ({ min = 180, gap = 14, children }: { min?: number; gap?: number; children: ReactNode }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap, maxWidth: 1100 }}>{children}</div>
);

export const Card = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14, ...style }}>{children}</div>
);

export const Small = ({ children, dim = true }: { children: ReactNode; dim?: boolean }) => (
  <div style={{ fontSize: 12, color: dim ? C.dim : C.fg, lineHeight: 1.5 }}>{children}</div>
);

/** AI 에게 하는 말 한 줄. 키트 명령은 AI 가 실행하고 학생은 허락 창만 누른다(note 에 AI 가 실행하는 명령을 적는다). */
export const Say = ({ label, text, note }: { label: string; text: string; note?: ReactNode }) => (
  <div style={{ fontSize: 12, background: "#18181B", border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 12px", margin: "8px 0", maxWidth: 820 }}>
    <div style={{ color: C.dim }}>{label}</div>
    <div style={{ color: C.fg, fontSize: 13, marginTop: 2 }}>"{text}"</div>
    {note ? <div style={{ color: C.dim, marginTop: 4 }}>{note}</div> : null}
  </div>
);
