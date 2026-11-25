#!/usr/bin/env node
/** Storybook Docs Canvas 안에서 떠 있는 패널이 잘리지 않는지 실제 브라우저로 확인한다. */
import { chromium } from "playwright";

const BASE = process.env.SB_URL ?? "http://localhost:6006";
const cases = [
  { name: "Popover/Open", story: "popover--open", panel: ".ds-popover__panel" },
  { name: "Tooltip/Top", story: "tooltip--top", trigger: ".ds-tooltip__anchor", action: "hover", panel: ".ds-tooltip__bubble" },
  { name: "Toggletip/Top", story: "toggletip--top", trigger: ".ds-toggletip__trigger", panel: ".ds-toggletip__panel" },
  { name: "OverflowMenu/Flipped", story: "overflowmenu--flipped", trigger: ".ds-overflowmenu__trigger", panel: ".ds-overflowmenu__list" },
  { name: "Dropdown/Default", story: "dropdown--default", trigger: ".ds-dropdown__trigger", panel: ".ds-dropdown__list" },
  { name: "ComboBox/Md", story: "combobox--md", trigger: ".ds-combobox__input", panel: ".ds-combobox__list" },
  { name: "MultiSelect/Default", story: "multiselect--default", trigger: ".ds-multiselect__trigger", panel: ".ds-multiselect__list" },
  { name: "DatePicker/Single", story: "datepicker--single", trigger: ".ds-datepicker__open", panel: ".ds-datepicker__panel" },
  { name: "Modal/Default", story: "modal--default", panel: ".ds-modal" },
  ...["popover", "tooltip", "toggletip"].flatMap((component) =>
    ["left", "right"].map((side) => ({
      name: `${component}/${side} (narrow)`, story: `${component}--${side}`,
      trigger: { popover: ".ds-popover__trigger", tooltip: ".ds-tooltip__anchor", toggletip: ".ds-toggletip__trigger" }[component],
      action: component === "tooltip" ? "hover" : "click",
      panel: { popover: ".ds-popover__panel", tooltip: ".ds-tooltip__bubble", toggletip: ".ds-toggletip__panel" }[component],
      width: 768,
    })),
  ),
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let failures = 0;

try {
  for (const check of cases) {
    await page.setViewportSize({ width: check.width ?? 1440, height: 900 });
    const component = check.story.split("--")[0];
    await page.goto(`${BASE}/?path=/docs/components-${component}--docs`, { waitUntil: "networkidle" });
    const frame = page.frame({ url: new RegExp(`id=components-${check.story}(?:&|$)`) });
    if (!frame) {
      console.log(`✖ ${check.name}: Docs 스토리 프레임 없음`);
      failures += 1;
      continue;
    }
    if (check.trigger) {
      const trigger = frame.locator(check.trigger);
      if (check.action === "hover") await trigger.hover();
      else await trigger.click();
    }
    const box = await frame.evaluate((selector) => {
      const panel = document.querySelector(selector);
      if (!panel) return null;
      const rect = panel.getBoundingClientRect();
      return { x: rect.left, y: rect.top, right: rect.right, bottom: rect.bottom,
        width: rect.width, height: rect.height, viewportWidth: innerWidth, viewportHeight: innerHeight };
    }, check.panel);
    const clipped = !box || !box.width || !box.height || box.x < 0 || box.y < 0 ||
      box.right > box.viewportWidth || box.bottom > box.viewportHeight;
    if (clipped) failures += 1;
    console.log(`${clipped ? "✖" : "✔"} ${check.name}${clipped ? `: ${JSON.stringify(box)}` : ""}`);
  }
} finally {
  await browser.close();
}

console.log(`\n${cases.length - failures}/${cases.length} 통과`);
process.exitCode = failures ? 1 : 0;
