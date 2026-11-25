#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { Deployer, parseDeployArgs } from "./lib/deploy.mjs";

try {
  const root = fileURLToPath(new URL("..", import.meta.url));
  await new Deployer(root).execute(parseDeployArgs(process.argv.slice(2)));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
