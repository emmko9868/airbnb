#!/usr/bin/env node
/** Storybook play를 실제 Chromium에서 실행한다. play 안의 userEvent.click/spy 검증이 실패하면 종료 코드 1. */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { currentApprovedComponentPlan, currentComponentPlan, nestedPartsFromPlan } from "./lib/component-plan.mjs";
import { nestedRenderProblems } from "./lib/component-quality.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const name = process.argv[2];
if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  console.error("Usage: pnpm ai:verify <ComponentName>");
  process.exit(1);
}
let nestedParts = [];
try {
  const latest = currentComponentPlan(root, name);
  if (latest?.metadata.status === "approved") nestedParts = nestedPartsFromPlan(currentApprovedComponentPlan(root, name), { validate: true });
} catch (error) {
  console.error(`Could not validate the approved Nested parts contract: ${error.message}`);
  process.exit(1);
}

const port = await new Promise((resolvePort, rejectPort) => {
  const server = createServer();
  server.once("error", rejectPort);
  server.listen(0, "127.0.0.1", () => {
    const assigned = server.address().port;
    server.close(() => resolvePort(assigned));
  });
});
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [
  join(root, "node_modules", "storybook", "bin", "index.cjs"),
  "dev", "--ci", "--no-open", "--disable-telemetry", "--exact-port", "-p", String(port), "-h", "127.0.0.1",
], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
let log = "";
for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => { log = (log + chunk).slice(-4000); });

let browser;
try {
  let index;
  const until = Date.now() + 90_000;
  while (Date.now() < until) {
    if (server.exitCode !== null) throw new Error(`Storybook failed to start:\n${log}`);
    try {
      const response = await fetch(`${base}/index.json`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) { index = await response.json(); break; }
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  if (!index) throw new Error(`Storybook took too long to start:\n${log}`);
  const stories = Object.values(index.entries).filter((entry) =>
    entry.type === "story" && entry.title === `Components/${name}`);
  const defaultStory = stories.find((entry) => entry.name === "Default") || stories[0];
  if (!defaultStory) throw new Error(`There are no Components/${name} stories. Add a story with a play function that clicks the part.`);
  let figma = null;
  try { figma = JSON.parse(readFileSync(join(root, "node_modules", ".cache", "ds-figma", "last.json"), "utf8")); } catch {}
  if (figma?.component !== name) figma = null;
  const focusStories = stories.filter((entry) => /^Focus/.test(entry.name));
  if (figma?.states?.some((state) => /focus/i.test(state)) && !focusStories.length) throw new Error(`Components/${name} has no Focus story, but the Figma design has a Focus state.`);
  const requiredPlayIds = new Set([defaultStory, stories.find((entry) => entry.name === "Disabled"), ...focusStories].filter(Boolean).map((story) => story.id));

  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  const stateChecks = [];
  const observedNestedComponents = new Set();
  let playCount = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.__dsPlayErrors = [];
    const watch = setInterval(() => {
      const channel = window.__STORYBOOK_ADDONS_CHANNEL__;
      const events = window.__STORYBOOK_MODULE_CORE_EVENTS__;
      if (!channel?.on || !events?.PLAY_FUNCTION_THREW_EXCEPTION) return;
      for (const event of [events.PLAY_FUNCTION_THREW_EXCEPTION, events.STORY_ERRORED, events.STORY_THREW_EXCEPTION]) {
        channel.on(event, (payload) => window.__dsPlayErrors.push({ event, payload: String(payload?.message || payload?.error?.message || payload) }));
      }
      clearInterval(watch);
    }, 1);
  });
  for (const story of stories) {
    errors.length = 0;
    await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: "networkidle", timeout: 30_000 });
    await page.waitForFunction(() => ["finished", "errored"].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase), null, { timeout: 20_000 });
    const result = await page.evaluate(() => ({
      phase: window.__STORYBOOK_PREVIEW__?.currentRender?.phase,
      hasPlay: typeof window.__STORYBOOK_PREVIEW__?.currentRender?.story?.playFunction === "function",
      playErrors: window.__dsPlayErrors || [],
      text: document.body.innerText.slice(0, 500),
    }));
    if (result.hasPlay) playCount += 1;
    const errorOverlay = await page.locator(".sb-errordisplay").isVisible();
    if ((requiredPlayIds.has(story.id) && !result.hasPlay) || result.phase !== "finished" || result.playErrors.length || errors.length || errorOverlay) {
      throw new Error(`${story.name}: Storybook render/play failed: phase=${result.phase}, play=${result.hasPlay}, error=${errors[0] || result.playErrors[0]?.payload || (errorOverlay ? await page.locator(".sb-errordisplay").innerText() : result.text)}`);
    }
    if (nestedParts.some((part) => part.kitComponent)) {
      const rootIds = [...new Set([`ds-${name.toLowerCase()}`, `ds-${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`])];
      const rootSelector = rootIds.map((id) => `[data-testid="${id}"]`).join(", ");
      const compositeRoot = page.locator(rootSelector).first();
      if (await compositeRoot.count()) {
        for (const component of [...new Set(nestedParts.map((part) => part.kitComponent).filter(Boolean))]) {
          const ids = [...new Set([`ds-${component.toLowerCase()}`, `ds-${component.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`])];
          if (await compositeRoot.locator(ids.map((id) => `[data-testid="${id}"]`).join(", ")).count()) observedNestedComponents.add(component);
        }
      }
    }
    if (story === defaultStory && figma?.colorStates?.length) {
      const buttons = page.getByRole("button");
      const count = await buttons.count();
      for (const side of ["Left", "Right"].filter((label) => figma.colorStates.some((entry) => new RegExp(`hover.*${label}`, "i").test(entry.state)))) {
        const index = side === "Right" ? 1 : 0;
        if (index >= count) throw new Error(`There is no ${side} button.`);
        const target = buttons.nth(index);
        await page.mouse.move(0, 0);
        const before = await target.evaluate((element) => getComputedStyle(element).backgroundColor);
        await target.hover();
        await page.waitForTimeout(180); // CSS background 전환(--duration-fast)이 끝난 뒤 색을 비교한다.
        const hover = await target.evaluate((element) => getComputedStyle(element).backgroundColor);
        if (hover === before) throw new Error(`The ${side} button's background does not change on hover (${hover}).`);
        stateChecks.push(`Hover ${side}`);
        if (figma.colorStates.some((entry) => new RegExp(`click.*${side}`, "i").test(entry.state))) {
          await page.mouse.down();
          await page.waitForTimeout(180);
          const active = await target.evaluate((element) => getComputedStyle(element).backgroundColor);
          await page.mouse.up();
          if (active === hover) throw new Error(`The ${side} button's background does not change when clicked (:active) (${active}).`);
          stateChecks.push(`Click ${side}`);
        }
      }
    }
    if (/^Focus/.test(story.name) && figma?.groupFocus) {
      const kebab = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
      const group = page.getByTestId(`ds-${kebab}`);
      // play 함수가 이미 Tab으로 좌→우 이동하며 검증했으므로, 완료 시점(오른쪽 버튼 포커스)에서 링 확인
      const style = await group.evaluate((element) => getComputedStyle(element).outlineStyle);
      if (style !== "solid") throw new Error(`${story.name}: after focus, outlineStyle is not solid: ${style}`);
      const width = await group.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth));
      if (width !== figma.groupFocus.width) throw new Error(`${story.name}: after focus, the ring is not the same width as the ${figma.groupFocus.width}px line in Figma: ${width}px`);
      stateChecks.push(`${story.name} (ring checked with the right button focused)`);
    }
  }
  const nestedProblems = nestedRenderProblems({ name, nestedParts, observedComponents: observedNestedComponents });
  if (nestedProblems.length) throw new Error(nestedProblems.join("\n"));
  console.log(`Storybook render/play passed: Components/${name} · ${stories.length} stories · ${playCount} play functions (Chromium)${stateChecks.length ? ` · ${stateChecks.join(", ")}` : ""}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await browser?.close();
  server.kill();
}
