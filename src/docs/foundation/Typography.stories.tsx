/* @ds-generated 22fd92f28104e3f2 — `pnpm ds:gen` 이 만든 파일입니다.
   Foundation — .ds/foundation.json 을 읽는 화면
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { C, H3, Note, Pill, Shell, Table, Td, useL } from "../chrome";
import { fontFiles, fontKey, fontStatus, hasFontFile } from "../../assets/fonts";
import type { FontFile, FontStatus } from "../../assets/fonts";
import { DATA, TOKENS, typeScale } from "./data";
import { Card, Code, Say, Small } from "./ui";

const meta = {
  title: "Foundation/Typography",
  parameters: { layout: "fullscreen", options: { showPanel: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE = "The quick brown fox jumps over the lazy dog 0123456789";
const SAMPLE_KO = "다람쥐 헌 쳇바퀴에 타고파 · The quick brown fox 0123";
const VARIABLE_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

/** 글꼴 목록 값의 첫 글꼴 이름. 시스템 글꼴이면 null — scripts/assets.mjs 와 같은 규칙. */
function firstFamily(value: string): string | null {
  const first = (value.split(",")[0] ?? "").trim().replace(/^["']|["']$/g, "");
  return !first || /^(?:system-ui|-apple-system|blinkmacsystemfont|sans-serif|serif|monospace|ui-[a-z-]+|var\(.*)$/i.test(first) ? null : first;
}

/** 등록한 글꼴 파일을 브라우저가 실제로 불러왔는지. */
function useFontStatus() {
  const [status, setStatus] = useState<Record<string, FontStatus>>({});
  useEffect(() => {
    let alive = true;
    for (const f of fontFiles) {
      void fontStatus(f.file).then((s) => {
        if (alive) setStatus((prev) => ({ ...prev, [f.file]: s }));
      });
    }
    return () => {
      alive = false;
    };
  }, []);
  return status;
}

function LoadPill({ status }: { status: FontStatus | undefined }) {
  const L = useL();
  if (status === "loaded") return <Pill tone="ok">{L("불러옴", "Loaded")}</Pill>;
  if (status === "error") return <Pill tone="bad">{L("불러오지 못함 — 파일을 다시 받으세요", "Couldn't load — download the file again")}</Pill>;
  return <Pill>{L("불러오는 중…", "Loading…")}</Pill>;
}

/** 토큰이 가리키는 글꼴을 지금 화면에서 무엇으로 보여 주는지. */
function FamilyPill({ family }: { family: string | null }) {
  const L = useL();
  if (!family) return <Pill>{L("컴퓨터 기본 글꼴", "Computer's system font")}</Pill>;
  return hasFontFile(family)
    ? <Pill tone="ok">{L("my-assets/typo 파일", "File in my-assets/typo")}</Pill>
    : <Pill tone="warn">{L("파일 없음 — 대체 글꼴로 보여요", "No file — shows in a fallback font")}</Pill>;
}

function FaceRows({ face, sample, status }: { face: FontFile; sample: string; status: FontStatus | undefined }) {
  const L = useL();
  const label = (weight: string | number) => `${weight}${face.style === "italic" ? " italic" : ""}`;
  const rows = face.variable ? VARIABLE_STEPS : [Number(face.weight)];
  return (
    <div style={{ marginTop: 10 }}>
      <Small>
        <Code>{face.file}</Code> · {face.variable ? L("가변 글꼴 100–900", "variable 100–900") : label(face.weight)} · <LoadPill status={status} />
      </Small>
      {rows.map((weight) => (
        <div key={weight} style={{ display: "flex", gap: 14, alignItems: "baseline", marginTop: 4 }}>
          <span style={{ width: 70, flex: "0 0 auto", color: C.dim, fontSize: 12 }}>{label(weight)}</span>
          <span style={{ fontFamily: `"${face.family}", system-ui`, fontWeight: weight, fontStyle: face.style, fontSize: face.variable ? 18 : 22, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sample}</span>
        </div>
      ))}
    </div>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 12, maxWidth: 860 }}>
      <span style={{ flex: "0 0 auto", width: 22, height: 22, borderRadius: 11, background: C.panel, border: `1px solid ${C.line}`, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>{n}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function TypographyPage() {
  const L = useL();
  const sample = L(SAMPLE_KO, SAMPLE);
  const status = useFontStatus();
  const families = new Map<string, FontFile[]>();
  for (const f of fontFiles) families.set(fontKey(f.family), [...(families.get(fontKey(f.family)) ?? []), f]);
  const figmaFamilies = DATA?.figma?.families ?? [];
  const missing = figmaFamilies.filter((family) => !families.has(fontKey(family)));
  const scale = typeScale();
  const starter = (category: string) => TOKENS.filter((t) => t.category === category && !t.typeScale);
  const fontTokens = TOKENS.filter((t) => t.category === "FONT_FAMILY");
  const sans = fontTokens.find((t) => t.cssVar === "--font-sans");
  const sansFamily = sans ? firstFamily(sans.value) : null;

  return (
    <Shell
      title={L("Typography — 글자", "Typography — text")}
      desc={L(
        "my-assets/typo 의 글꼴, 글자 토큰이 쓰는 글꼴, 글자 크기 체계의 실제 모습, 글꼴을 바꾸는 방법이에요. Storybook 과 웹사이트는 같은 토큰과 같은 글꼴 파일을 써요.",
        "Your fonts in my-assets/typo, which font each text token uses, how the type scale really looks, and how to change the font. Storybook and your website use the same tokens and the same font files.",
      )}
    >
      <H3>{L(`글꼴 파일 (my-assets/typo · ${fontFiles.length}개)`, `Font files (my-assets/typo · ${fontFiles.length})`)}</H3>
      {fontFiles.length === 0 ? (
        <Note>
          {L(
            "아직 글꼴 파일이 없어서 컴퓨터의 기본 글꼴로 보여요. 글꼴 파일(.woff2 .woff .ttf .otf)을 my-assets 에 넣고 AI 에게 정리를 부탁하세요:",
            "No font files yet, so your computer's default font is used. Drop font files (.woff2 .woff .ttf .otf) into my-assets and ask the AI to sort them:",
          )}
          <Say label={L("AI 에게 이렇게 말해요", "Tell the AI")} text={L("my-assets 에 넣은 파일 정리해 줘", "Sort the files I put in my-assets.")} note={L("AI 가 정리 명령(pnpm assets)을 실행해요. 허락 창 → Yes, allow once", "The AI runs the sorting command (pnpm assets). Permission prompt → Yes, allow once")} />
        </Note>
      ) : (
        [...families.values()].map((faces) => (
          <Card key={faces[0]?.family} style={{ marginBottom: 10, maxWidth: 1100 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{faces[0]?.family}</span>
              <Small>
                {L(`파일 ${faces.length}개`, `${faces.length} file(s)`)}
                {sansFamily && faces[0] && fontKey(sansFamily) === fontKey(faces[0].family) ? <> · <Pill tone="ok">{L("부품·페이지가 쓰는 글꼴 (--font-sans)", "Used by parts and pages (--font-sans)")}</Pill></> : null}
              </Small>
            </div>
            {faces.map((face) => <FaceRows key={face.file} face={face} sample={sample} status={status[face.file]} />)}
          </Card>
        ))
      )}
      {missing.length ? (
        <Note tone="warn">
          {L("Figma 텍스트 스타일이 쓰는데 파일이 없는 글꼴: ", "Fonts your Figma text styles use but have no file yet: ")}
          {missing.map((m) => <span key={m} style={{ marginRight: 6 }}><Pill tone="warn">{m}</Pill></span>)}
          <div style={{ marginTop: 4 }}>{L("이 글꼴은 다른 글꼴로 대신 보여요. 글꼴 파일을 my-assets 에 넣고 AI 에게 정리를 부탁하세요(AI 가 pnpm assets 실행).", "They show in a fallback font until you drop the font files into my-assets and sort them with pnpm assets.")}</div>
        </Note>
      ) : null}

      <H3>{L("어떤 토큰이 어떤 글꼴을 쓰나요", "Which font each text token uses")}</H3>
      <Table head={[L("토큰", "Token"), L("쓰는 곳", "Used by"), L("글꼴", "Font"), L("지금 보이는 글꼴", "Shows as"), L("미리보기", "Preview")]} width={1100}>
        {fontTokens.map((t) => {
          const family = firstFamily(t.value);
          return (
            <tr key={t.cssVar}>
              <Td mono>{t.cssVar}</Td>
              <Td dim>{t.typeScale ? L(`Figma 텍스트 스타일 ${t.typeScale}`, `Figma text style ${t.typeScale}`) : t.cssVar === "--font-sans" ? L("모든 부품과 페이지", "All parts and pages") : "—"}</Td>
              <Td>{family ?? <span style={{ color: C.dim }}>{t.value}</span>}</Td>
              <Td><FamilyPill family={family} /></Td>
              <Td><span style={{ fontFamily: `var(${t.cssVar})`, fontSize: 18 }}>Aa Bb 가나 123</span></Td>
            </tr>
          );
        })}
      </Table>
      {fontTokens.some((t) => t.typeScale) ? null : (
        <Small>{L("Figma 텍스트 스타일을 가져오면 스타일마다 --font-type-* 토큰이 여기에 더해져요.", "When you import your Figma text styles, each style adds a --font-type-* token here.")}</Small>
      )}

      <H3>{L("글자 크기 체계 — 스타터 글자 역할 (부품이 쓰는 것)", "Type scale — starter text roles (used by parts)")}</H3>
      {starter("FONT_SIZE").map((t) => (
        <div key={t.name} style={{ display: "flex", gap: 16, alignItems: "baseline", padding: "8px 0", borderBottom: `1px solid ${C.line}`, maxWidth: 1100 }}>
          <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-sans)", fontSize: `var(${t.cssVar})`, lineHeight: "var(--leading-normal)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sample}</span>
          <Small><Code>{t.cssVar}</Code> {t.value}</Small>
        </div>
      ))}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 10, maxWidth: 1100 }}>
        {starter("FONT_WEIGHT").map((t) => (
          <div key={t.name}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-body-1)", fontWeight: `var(${t.cssVar})` }}>Aa Bb 가나</div>
            <Small><Code>{t.cssVar}</Code> {t.value}</Small>
          </div>
        ))}
        {starter("LINE_HEIGHT").map((t) => (
          <div key={t.name} style={{ maxWidth: 220 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-body-2)", lineHeight: `var(${t.cssVar})`, borderLeft: `2px solid ${C.line}`, paddingLeft: 8 }}>
              {L("두 줄로 보이는 문장으로 줄 간격을 확인해요.", "Two lines of text show the line spacing.")}
            </div>
            <Small><Code>{t.cssVar}</Code> {t.value}</Small>
          </div>
        ))}
      </div>

      <H3>{L("글자 크기 체계 — Figma 텍스트 스타일 (--text-type-*)", "Type scale — your Figma text styles (--text-type-*)")}</H3>
      {scale.length === 0 ? (
        <>
          <Small>{L("Figma에서 가져오면 텍스트 스타일이 --text-type-* 토큰으로 여기에 보여요. 기존 글자 역할은 바뀌지 않아요.", "When you import from Figma, text styles show here as --text-type-* tokens. The existing text roles don't change.")}</Small>
          <Say label={L("AI 에게 이렇게 말해요", "Tell the AI")} text={L("내 Figma 파일 다시 가져와 줘 <Figma 링크>", "Bring in my Figma file again <Figma link>.")} note={L("AI 가 가져오기 명령(pnpm ds:figma)을 실행해요. 허락 창 → Yes, allow once", "The AI runs the import command (pnpm ds:figma). Permission prompt → Yes, allow once")} />
        </>
      ) : (
        scale.map(([slug, t]) => (
          <div key={slug} style={{ borderBottom: `1px solid ${C.line}`, padding: "12px 0", maxWidth: 1100 }}>
            <div
              style={{
                fontFamily: t.FONT_FAMILY ? `var(${t.FONT_FAMILY.cssVar})` : undefined,
                fontSize: t.FONT_SIZE ? `var(${t.FONT_SIZE.cssVar})` : undefined,
                fontWeight: t.FONT_WEIGHT ? `var(${t.FONT_WEIGHT.cssVar})` : undefined,
                lineHeight: t.LINE_HEIGHT ? `var(${t.LINE_HEIGHT.cssVar})` : undefined,
                letterSpacing: t.LETTER_SPACING ? `var(${t.LETTER_SPACING.cssVar})` : undefined,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}
            >
              {sample}
            </div>
            <Small>
              <b style={{ color: C.fg }}>{slug}</b> · {t.FONT_SIZE?.value ?? "—"} / {t.LINE_HEIGHT?.value ?? "—"} / {t.FONT_WEIGHT?.value ?? "—"}
              {t.FONT_FAMILY ? ` / ${firstFamily(t.FONT_FAMILY.value) ?? t.FONT_FAMILY.value}` : ""} · <Code>{t.FONT_SIZE?.cssVar ?? ""}</Code>
              {t.FONT_FAMILY ? <> · <FamilyPill family={firstFamily(t.FONT_FAMILY.value)} /></> : null}
            </Small>
          </div>
        ))
      )}

      <H3>{L("글꼴 바꾸기 (선택)", "Change the font (optional)")}</H3>
      <Small>
        {L(
          "바꾸지 않으면 할 일이 없어요. 부품과 페이지는 --font-sans 하나를 써요. Storybook 과 웹사이트는 같은 토큰(src/tokens/tokens.css)과 같은 글꼴 파일(my-assets/typo)을 쓰니 함께 바뀌어요.",
          "If you don't change anything, there's nothing to do. Parts and pages use one font token, --font-sans. Storybook and your website read the same tokens (src/tokens/tokens.css) and the same font files (my-assets/typo), so they change together.",
        )}
      </Small>
      <Step n={1}>
        {L("글꼴 파일을 my-assets 에 넣고 정리해요. my-assets/typo 로 옮겨지고 Pretendard-Bold.woff2 처럼 이름이 정리돼요. AI 에게 정리를 부탁해요.", "Drop the font files into my-assets and sort them. They move to my-assets/typo with names like Pretendard-Bold.woff2. Ask the AI to sort them.")}
        <Say label={L("AI 에게 이렇게 말해요", "Tell the AI")} text={L("my-assets 에 넣은 파일 정리해 줘", "Sort the files I put in my-assets.")} note={L("AI 가 정리 명령(pnpm assets)을 실행해요. 허락 창 → Yes, allow once", "The AI runs the sorting command (pnpm assets). Permission prompt → Yes, allow once")} />
      </Step>
      <Step n={2}>
        {L("Figma 텍스트 스타일이 그 글꼴을 써야 해요. 글자 계획은 Figma 에 있는 글꼴만 고를 수 있어요. Figma 에서 막 바꿨다면 다시 가져와요.", "Your Figma text styles must use that font — a text plan only picks fonts from Figma. If you just changed it in Figma, import again.")}
        <Say label={L("AI 에게 이렇게 말해요", "Tell the AI")} text={L("내 Figma 파일 다시 가져와 줘 <Figma 링크>", "Bring in my Figma file again <Figma link>.")} note={L("AI 가 가져오기 명령(pnpm ds:figma)을 실행해요. 허락 창 → Yes, allow once", "The AI runs the import command (pnpm ds:figma). Permission prompt → Yes, allow once")} />
      </Step>
      <Step n={3}>
        {L("AI 에게 글자 계획을 부탁해요. 질문은 선택지로 나와요(맞는 게 없으면 Other 에 직접 써요). 예: ", "Ask the AI for a text plan. Its questions come as choices (none fits? type your own in Other). For example: ")}
        <Code>{L("내 글꼴로 바꾸고 싶어. 글자 계획(docs/plans/typography.md)을 만들어 줘.", "I want to use my font. Please make a text plan (docs/plans/typography.md).")}</Code>
        <Small>{L("AI 는 docs/templates/typography-plan.md 양식으로 써요.", "The AI uses the docs/templates/typography-plan.md template.")}</Small>
      </Step>
      <Step n={4}>
        {L("위 글꼴 파일이 '불러옴'으로 보이는지 확인해요. AI 가 선택지로 물으면 '예'를 골라요. 계획 파일은 AI 가 고쳐요.", "Check the font shows as Loaded above. When the AI asks with choices, pick Yes. The AI updates the plan file.")}
      </Step>
      <Step n={5}>
        {L("바뀔 값을 확인해요. 준비는 승인하지 않아요.", "Check what will change. Preparing approves nothing.")}
        <Say label={L("AI 에게 이렇게 말해요", "Tell the AI")} text={L("글자 계획 준비해 줘", "Prepare the text plan.")} note={L("AI 가 준비 명령(pnpm ds:apply-token-plan docs/plans/typography.md --prepare)을 실행해요. 허락 창 → Yes, allow once", "The AI runs the prepare command (pnpm ds:apply-token-plan docs/plans/typography.md --prepare). Permission prompt → Yes, allow once")} />
      </Step>
      <Step n={6}>
        {L("AI 가 대화창에 바뀔 값을 짧게 보여 줘요. 맞으면 선택지에서 'Approve revision N'을 골라요. 고칠 게 있으면 'Change something'을 골라 말로 알려 줘요.", "The AI shows the changes in the chat. If they look right, pick 'Approve revision N' in the choices. To fix something, pick 'Change something' and tell the AI.")}
      </Step>
      <Step n={7}>
        {L("AI 에게 적용을 부탁해요. 그다음 Storybook 과 웹사이트에서 글자를 확인하고, 모습이 바뀐 부품은 다시 검수해요.", "Ask the AI to apply it. Then look at the text in Storybook and on your website, and review again any part whose look changed.")}
        <Say label={L("AI 에게 이렇게 말해요", "Tell the AI")} text={L("글자 계획 적용해 줘", "Apply the text plan.")} note={L("AI 가 적용 명령(pnpm ds:apply-token-plan docs/plans/typography.md)을 실행해요. 허락 창 → Yes, allow once", "The AI runs the apply command (pnpm ds:apply-token-plan docs/plans/typography.md). Permission prompt → Yes, allow once")} />
      </Step>
      <Note>
        {L("기본 글자로 되돌리려면 터미널에서 직접 실행해요(AI 에게 맡기지 않아요): ", "To go back to the default text, run this yourself in a terminal (not through the AI): ")}
        <Code>pnpm ds:reset-typography</Code>
      </Note>
    </Shell>
  );
}

export const Typography: Story = { name: "Typography", render: () => <TypographyPage /> };
