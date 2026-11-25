#!/usr/bin/env node
import { closeSync, existsSync, lstatSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { buildCatalog, STARTER_CATALOG_BASELINE, starterCatalogBaseline } from "./lib/catalog.mjs";

const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : fileURLToPath(new URL("..", import.meta.url));
const target = resolve(root, STARTER_CATALOG_BASELINE);
let rl;

try {
  if (process.argv.length !== 2) throw new Error("Usage: pnpm ds:starter-baseline");
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("A maintainer must run this command directly in an interactive terminal. AI shells and redirected input are refused.");
  const stat = lstatSync(target, { throwIfNoEntry: false });
  if (stat?.isSymbolicLink() || (stat && !stat.isFile())) throw new Error(`${STARTER_CATALOG_BASELINE} must be a regular file, not a link.`);
  const catalog = await buildCatalog(root);
  const data = starterCatalogBaseline(catalog);
  process.stdout.write(`This replaces ${STARTER_CATALOG_BASELINE} with the current public API/code, CSS and dependency hashes for ${catalog.rows.length} starter parts.\n`);
  process.stdout.write("Students will be able to use every matching part without a separate review. Do this only while preparing a starter release.\n");
  rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  const answer = (await rl.question("Type UPDATE STARTER BASELINE to continue: ")).trim();
  if (answer !== "UPDATE STARTER BASELINE") throw new Error("Cancelled. The starter baseline was not changed.");
  const before = existsSync(target) ? readFileSync(target, "utf8") : null;
  const content = JSON.stringify(data, null, 2) + "\n";
  if (before === content) {
    process.stdout.write(`Unchanged: ${STARTER_CATALOG_BASELINE}\n`);
  } else {
    mkdirSync(dirname(target), { recursive: true });
    const lockPath = target + ".lock";
    const lock = openSync(lockPath, "wx");
    const temporary = `${target}.${randomUUID()}.tmp`;
    try {
      const current = existsSync(target) ? readFileSync(target, "utf8") : null;
      if (current !== before) throw new Error("The starter baseline changed while the catalog was being read. Run the command again.");
      writeFileSync(temporary, content, { flag: "wx", mode: 0o644 });
      renameSync(temporary, target);
    } finally {
      if (existsSync(temporary)) unlinkSync(temporary);
      closeSync(lock);
      unlinkSync(lockPath);
    }
    process.stdout.write(`Updated: ${STARTER_CATALOG_BASELINE}\n`);
  }
} catch (error) {
  console.error(`Starter baseline update stopped: ${error.message}`);
  process.exitCode = 1;
} finally {
  rl?.close();
}
