#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { checkPage, generatePages } from "./lib/page-flow.mjs";
try {
  const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : fileURLToPath(new URL("..", import.meta.url));
  const [mode, target, ...extra] = process.argv.slice(2);
  if (!target || extra.length || !["generate", "check"].includes(mode)) throw new Error("Usage: pnpm ds:page docs/plans/pages/<Site>.md / pnpm ai:check-page <Name>");
  if (mode === "generate") {
    const result = await generatePages(root, target);
    if (result.visualReviewNeeded.length) console.log(`Check the visuals again (the behavior review and page use still count): ${result.visualReviewNeeded.join(", ")}`);
    console.log(`Made the page skeleton from the approved plan: ${result.files.join(", ")}. Connect the data/event slots you declared, then check with ai:check-page. The human review is a separate step.`);
  } else {
    const result = await checkPage(root, target);
    if (result.visualReviewNeeded.length) console.log(`Check the visuals again (the behavior review and page use still count): ${result.visualReviewNeeded.join(", ")}`);
    console.log(`${result.name}: static check passed, ${result.status}. A person must still check the real screen, events and responsive layout, and compare it with the original.`);
  }
} catch (error) { console.error(`Page work blocked: ${error.message}`); process.exitCode = 1; }
