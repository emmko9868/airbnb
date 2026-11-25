/* @ds-generated 9525db462a24f094 — `pnpm ds:gen` 이 만든 파일입니다.
   Figma: Badge (0:5200)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import figma from "@figma/code-connect";
import { Badge } from "./Badge";

figma.connect(Badge, "https://www.figma.com/design/SAMPLEKEY123/?node-id=0-5200", {
  props: {
    tone: figma.enum("Tone", {
      "Neutral": "neutral",
      "Info": "info",
      "Success": "success",
      "Warning": "warning",
      "Danger": "danger",
    }),
    children: figma.string("Label"),
  },
  example: ({ tone, children }) => (
    <Badge tone={tone}>{children}</Badge>
  ),
});
