#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalog, selectCatalog } from "./lib/catalog.mjs";

try {
  const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)), "..");
  process.stdout.write(selectCatalog(await buildCatalog(root), process.argv.slice(2)));
} catch (error) {
  console.error(`Catalog lookup failed: ${error.message}`);
  process.exitCode = 1;
}
