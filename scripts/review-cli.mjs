#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runHumanReview } from "./lib/human-review.mjs";

try {
  const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)), "..");
  await runHumanReview({ root, args: process.argv.slice(2) });
} catch (error) {
  console.error(`학생 검수 중단 / Student review stopped: ${error.message}`);
  process.exitCode = 1;
}
