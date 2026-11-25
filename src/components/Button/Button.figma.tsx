/* @ds-generated ac8399c960d7381a — `pnpm ds:gen` 이 만든 파일입니다.
   Figma: Button (232:1522)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import figma from "@figma/code-connect";
import { Button } from "./Button";

figma.connect(Button, "https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/?node-id=232-1522", {
  props: {
    variant: figma.enum("Type", {
      "Primary": "primary",
      "Secondary": "secondary",
      "Tertiary": "tertiary",
      "Link": "link",
    }),
    size: figma.enum("Size", {
      "Full-width": "large",
      "Small": "small",
    }),
    isLoading: figma.boolean("Loading"),
    disabled: figma.boolean("Disabled"),
    fullWidth: figma.boolean("Full-width"),
    children: figma.string("Label"),
  },
  example: ({ variant, size, isLoading, disabled, fullWidth, children }) => (
    <Button variant={variant} size={size} isLoading={isLoading} disabled={disabled} fullWidth={fullWidth}>{children}</Button>
  ),
});
