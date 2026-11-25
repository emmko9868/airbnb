/* @ds-generated fdba2cf62057848d — `pnpm ds:gen` 이 만든 파일입니다.
   Foundation — .ds/foundation.json 을 읽는 화면
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { C, H3, Note, Shell, useL } from "../chrome";
import { TOKENS } from "./data";
import { Code, Small } from "./ui";

const meta = {
  title: "Foundation/Motion",
  parameters: { layout: "fullscreen", options: { showPanel: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function MotionPage() {
  const L = useL();
  const [moved, setMoved] = useState(false);
  const durations = TOKENS.filter((t) => t.category === "DURATION");
  const easings = TOKENS.filter((t) => t.category === "EASING");
  const ease = easings[0]?.cssVar ?? "--ease-standard";
  return (
    <Shell
      title={L("Motion — 움직임", "Motion — movement")}
      desc={L("마우스를 올리거나 열고 닫을 때 바뀌는 속도와 방식이에요.", "How fast and in what way things change when you hover, open or close them.")}
    >
      {durations.length + easings.length === 0 ? <Note>{L("움직임 토큰이 없어요.", "No motion tokens.")}</Note> : null}
      <button type="button" onClick={() => setMoved((v) => !v)} style={{ font: "inherit", color: C.fg, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
        {L("움직여 보기", "Play")}
      </button>
      <H3>{L("시간", "Duration")}</H3>
      {durations.map((t) => (
        <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0", borderBottom: `1px solid ${C.line}`, maxWidth: 900 }}>
          <span style={{ width: 190 }}><Code>{t.cssVar}</Code> <Small>{t.value}</Small></span>
          <span style={{ position: "relative", flex: 1, height: 24 }}>
            <span style={{ position: "absolute", top: 0, left: moved ? "calc(100% - 24px)" : 0, width: 24, height: 24, borderRadius: 6, background: "#2E81FF", transition: `left var(${t.cssVar}) var(${ease})` }} />
          </span>
        </div>
      ))}
      <H3>{L("방식 (easing)", "Easing")}</H3>
      {easings.map((t) => (
        <div key={t.name} style={{ padding: "4px 0" }}><Code>{t.cssVar}</Code> <Small>{t.value}</Small></div>
      ))}
    </Shell>
  );
}

export const Motion: Story = { name: "Motion", render: () => <MotionPage /> };
