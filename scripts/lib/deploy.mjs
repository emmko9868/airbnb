import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { delimiter, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { readWebProject } from "./web-project.mjs";

export const TARGETS = {
  web: { script: "web:build", output: "dist", framework: "vite" },
  storybook: { script: "build-storybook", output: "storybook-static", framework: null },
};
export const DEPLOY_METHODS = ["git", "api"];
const LOCAL_CONFIG = ".vercel/deploy.json";
const stripAnsi = (value) => String(value || "").replace(/\x1b\[[0-9;]*m/g, "");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export function parseDeployArgs(args) {
  const options = { mode: args[0] || "help", files: [], all: false };
  Object.defineProperty(options, "rawArgs", { value: [...args], enumerable: false });
  if (!["help", "check", "setup", "publish", "production", "forget-token"].includes(options.mode)) {
    throw new Error("Choose a deploy command: check, setup, publish, production or forget-token.");
  }
  for (let index = 1; index < args.length; index++) {
    const flag = args[index];
    if (flag === "--all") {
      options.all = true;
      continue;
    }
    if (!["--target", "--method", "--project", "--repo", "--message", "--file"].includes(flag)
      || !args[index + 1]
      || args[index + 1].startsWith("--")) {
      throw new Error(`Check the deploy option: ${flag}`);
    }
    const value = args[++index];
    if (flag === "--file") options.files.push(value);
    else options[flag.slice(2)] = value;
  }
  if (options.target && !TARGETS[options.target]) throw new Error("The deploy target must be web or storybook.");
  if (options.method && !DEPLOY_METHODS.includes(options.method)) throw new Error("The deploy method must be git or api.");
  if (options.all && options.files.length) throw new Error("Do not use --all and --file together.");
  if (options.mode !== "setup" && (options.method || options.project || options.repo)) {
    throw new Error("Use --method, --project and --repo only with setup.");
  }
  return options;
}

export const STILL_WORKING = "Vercel is still working. Check the Deployments page in Vercel, or ask the AI to deploy again.";
export const FORGET_HINT = "If you don't need it anymore, also delete it in Vercel → Account Settings → Tokens.";
const GITHUB_SIGN_IN = "GitHub needs you to sign in once. In VS Code, open Terminal → New Terminal and run gh auth login, then gh auth setup-git (troubleshooting J, \"GitHub needs you to sign in once\"). Then ask the AI to deploy again.";
const GIT_ENV = { GIT_TERMINAL_PROMPT: "0" };
const ASK_METHOD = "which way to deploy — \"Vercel only\" (way 2, setup --method api) or \"GitHub + Vercel\" (way 1, setup --method git)? Then run setup again with --method.";
const ASK_PROJECT = "a new Vercel project name (lowercase letters, numbers, ., _ and - only). Then run setup again with --project <name>.";
const ASK_REPO = "the address of their own GitHub repository. Then run setup again with --repo <address>.";

/** The saved Vercel token lives in the home folder, outside every project folder. */
export function tokenFile(env = process.env, platform = process.platform) {
  const home = String((platform === "win32" ? env.USERPROFILE : env.HOME) || "").trim() || homedir();
  return join(home, ".ds-starter", "vercel-token");
}

const tokenShape = (value) => typeof value === "string" && /^\S{8,400}$/.test(value);

export function readSavedToken(path) {
  try {
    const value = readFileSync(path, "utf8").trim();
    return tokenShape(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveToken(path, token, platform = process.platform) {
  if (!tokenShape(token)) throw new Error("Enter one Vercel token without spaces.");
  const folder = dirname(path);
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  writeFileSync(path, `${token}\n`, { mode: 0o600 });
  if (platform !== "win32") {
    chmodSync(folder, 0o700);
    chmodSync(path, 0o600);
  }
}

export function forgetToken(path) {
  if (!existsSync(path)) return false;
  rmSync(path, { force: true });
  return true;
}

/** True when a person can answer questions in this terminal. The AI's shell never counts, even with a pseudo-terminal. */
export function interactiveTerminal(env = process.env) {
  return env.QWEN_CODE !== "1" && Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function tokenPage(path, message = "", done = false) {
  const note = message ? `<p class="note${done ? " ok" : ""}" role="status">${escapeHtml(message)}</p>` : "";
  const form = done ? "" : `<form method="post" action="${path}">
<label for="token">Vercel token</label>
<input id="token" name="token" type="password" autocomplete="off" spellcheck="false" required autofocus>
<button type="submit">Save</button>
</form>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Paste your Vercel token</title>
<style>
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;padding:24px 16px;background:#f7f7f8;color:#1a1a1a}
main{max-width:480px;margin:0 auto;background:#fff;border:1px solid #ddd;border-radius:12px;padding:24px}
h1{font-size:22px;margin:0 0 12px}p{line-height:1.5;margin:0 0 12px}
label{display:block;font-weight:600;margin:16px 0 6px}
input{box-sizing:border-box;width:100%;font-size:16px;padding:10px;border:1px solid #999;border-radius:8px}
button{margin-top:12px;font-size:16px;padding:10px 20px;border:0;border-radius:8px;background:#0b5fff;color:#fff;cursor:pointer}
.note{padding:10px;border-radius:8px;background:#fdecec;color:#8a1111}.note.ok{background:#e8f6ec;color:#11602b}
</style></head><body><main>
<h1>Paste your Vercel token</h1>
<p>Make a token in Vercel → Account Settings → Tokens. When you make it, set Expiration to about the day your class ends.</p>
<p>Paste it here, not in the AI chat. It is saved only on this computer, outside your project.</p>
${note}${form}
</main></body></html>`;
}

/**
 * A one-time page on 127.0.0.1 that takes the Vercel token from a POST body.
 * Only the random secret path answers; every other path is 404.
 */
export function startTokenPage({ verify, timeoutMs = 480_000, host = "127.0.0.1" } = {}) {
  const secret = randomBytes(32).toString("hex");
  const path = `/${secret}`;
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
  };
  let finish;
  let fail;
  const token = new Promise((resolveToken, rejectToken) => { finish = resolveToken; fail = rejectToken; });
  token.catch(() => {});
  let settled = false;
  let port = 0;
  const server = createServer((request, response) => {
    const send = (status, body) => {
      response.writeHead(status, { ...headers, Connection: "close" });
      response.end(body);
    };
    const url = new URL(request.url || "/", "http://127.0.0.1");
    if (request.headers.host !== `${host}:${port}` || url.pathname !== path || url.search || settled) {
      send(404, "Not found");
      return;
    }
    if (request.method === "GET") {
      send(200, tokenPage(path));
      return;
    }
    if (request.method !== "POST") {
      send(405, "Not allowed");
      return;
    }
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 8192) request.destroy();
    });
    request.on("end", async () => {
      const value = String(new URLSearchParams(body).get("token") || "").trim();
      if (!tokenShape(value)) {
        send(200, tokenPage(path, "Paste one Vercel token without spaces."));
        return;
      }
      let works;
      try {
        works = await verify(value);
      } catch {
        send(200, tokenPage(path, "Could not reach Vercel. Check the internet, then press Save again."));
        return;
      }
      if (!works) {
        send(200, tokenPage(path, "This token does not work. Make a new one in Vercel and paste it again."));
        return;
      }
      if (settled) {
        send(404, "Not found");
        return;
      }
      settled = true;
      send(200, tokenPage(path, "Saved. Go back to VS Code.", true));
      close();
      finish(value);
    });
  });
  const timer = setTimeout(() => {
    if (settled) return;
    settled = true;
    close();
    fail(new Error("No token was entered. Ask the AI to deploy again."));
  }, timeoutMs);
  function close() {
    clearTimeout(timer);
    server.close();
    server.closeIdleConnections?.();
  }
  const ready = new Promise((resolveReady, rejectReady) => {
    server.once("error", rejectReady);
    server.listen(0, host, () => {
      port = server.address().port;
      resolveReady({ url: `http://${host}:${port}${path}`, token, close: () => {
        if (settled) return;
        settled = true;
        close();
        fail(new Error("The token page was closed."));
      } });
    });
  });
  return ready;
}

/** Opens the address in the default browser. Resolves false when no browser could be started. */
export function openInBrowser(url, platform = process.platform) {
  const [command, args] = platform === "darwin"
    ? ["open", [url]]
    : platform === "win32"
      ? ["rundll32", ["url.dll,FileProtocolHandler", url]]
      : ["xdg-open", [url]];
  return new Promise((resolveOpen) => {
    try {
      const child = spawn(command, args, { stdio: "ignore", detached: true });
      child.once("error", () => resolveOpen(false));
      child.once("spawn", () => {
        child.unref();
        resolveOpen(true);
      });
    } catch {
      resolveOpen(false);
    }
  });
}

export function githubRepository(value) {
  const text = String(value || "").trim();
  const match = text.match(/^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/i)
    || text.match(/^git@github\.com:([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/i);
  if (!match || [match[1], match[2]].some((part) => part === "." || part === "..")) {
    throw new Error("Enter the HTTPS or SSH address of your own GitHub repository.");
  }
  const key = `${match[1]}/${match[2]}`.toLowerCase();
  if (key === "dearkim/ds-starter") {
    throw new Error("This will not push to the instructor's starter repository. Use setup --repo <your GitHub repository URL> to choose your own repository.");
  }
  return { owner: match[1], name: match[2], key, url: text };
}

export function excludedDeployPath(path) {
  const normalized = String(path).replaceAll("\\", "/");
  return normalized.split("/").some((part) => [".git", ".vercel", "node_modules", "dist", "storybook-static", "var", ".DS_Store"].includes(part)
    || (part.startsWith(".env") && part !== ".env.example"))
    || /(?:^|\/)\.claude\/settings\.local\.json$/.test(normalized)
    || /\.log$/i.test(normalized);
}

export function gitChanges(text) {
  const parts = String(text).split("\0");
  const changes = [];
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (!part) continue;
    const status = part.slice(0, 2);
    const path = part.slice(3);
    const from = /[RC]/.test(status) ? parts[++index] : undefined;
    if (!path || /[U]/.test(status) || ["AA", "DD"].includes(status)) throw new Error("Fix the Git conflicts first.");
    changes.push({ status, path, from });
  }
  return changes;
}

export function vercelTargetConfig(target, current = {}, routes = []) {
  const selected = TARGETS[target];
  if (!selected) throw new Error("Check the deploy target.");
  const rewritesAreManaged = !current.rewrites?.some((rule) => rule.destination !== "/index.html");
  if ((current.routes || current.redirects) || !rewritesAreManaged) {
    throw new Error("vercel.json has routing settings that the deploy helper does not own. Check the target and paths yourself.");
  }
  const config = {
    ...current,
    $schema: "https://openapi.vercel.sh/vercel.json",
    framework: selected.framework,
    installCommand: "pnpm install --frozen-lockfile",
    buildCommand: `pnpm typecheck && pnpm ds:guard && pnpm ${selected.script}`,
    outputDirectory: selected.output,
  };
  if (target === "web") {
    const rewrites = routes.filter((route) => route !== "/").map((source) => ({ source, destination: "/index.html" }));
    if (rewrites.length) config.rewrites = rewrites;
    else delete config.rewrites;
  } else {
    delete config.rewrites;
  }
  return config;
}

// .cmd execution passes commands and arguments to PowerShell as data, not shell source.
export function processInvocation(command, args, platform = process.platform) {
  if (platform !== "win32" || !["npm", "pnpm", "vercel"].includes(command)) return { command, args };
  const data = Buffer.from(JSON.stringify({ command: `${command}.cmd`, args }), "utf8").toString("base64");
  const script = `$ErrorActionPreference='Stop'; $i=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${data}'))|ConvertFrom-Json; $a=@($i.args); & $i.command @a; exit $LASTEXITCODE`;
  return { command: "powershell.exe", args: ["-NoProfile", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")] };
}

export function processRunner(root, env = { ...process.env }) {
  return (command, args, { capture = false, timeout = 600_000, env: extra = {} } = {}) => new Promise((resolveResult) => {
    const invocation = processInvocation(command, args);
    const child = spawn(invocation.command, invocation.args, {
      cwd: root,
      env: { ...env, ...extra },
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";
    let finished = false;
    const done = (result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolveResult(result);
    };
    if (capture) {
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
    }
    const timer = setTimeout(() => {
      child.kill();
      done({ status: 1, stdout, stderr: `${command} took too long and was stopped.` });
    }, timeout);
    child.on("error", (error) => done({ status: 127, stdout, stderr: error.message }));
    child.on("exit", (status) => done({ status: status ?? 1, stdout, stderr }));
  });
}

export async function terminalQuestion(question) {
  if (!process.stdin.isTTY) throw new Error("Run this in an interactive terminal, or give the required setup options on the command line.");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

function validProjectName(value) {
  return /^[a-z0-9](?:[a-z0-9._-]{0,98}[a-z0-9])?$/.test(String(value || ""));
}

function apiRouteSource(source) {
  const pattern = source.split("/").map((segment) => {
    if (!segment) return "";
    if (segment.startsWith(":")) return "[^/]+";
    return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }).join("/");
  return `^${pattern}/?$`;
}

export class Deployer {
  constructor(root, {
    run,
    ask = terminalQuestion,
    interactive,
    fetch = globalThis.fetch,
    log = console.log,
    env = { ...process.env },
    now = Date.now,
    sleep = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds)),
    waitMs = 540_000,
    budgetMs = 540_000,
    tokenWaitMs = 480_000,
    tokenPage = startTokenPage,
    openBrowser = openInBrowser,
    platform = process.platform,
  } = {}) {
    this.root = resolve(root);
    this.env = env;
    this.run = run || processRunner(this.root, env);
    this.ask = ask;
    this.interactive = interactive ?? interactiveTerminal(env);
    this.budgetMs = budgetMs;
    this.tokenWaitMs = tokenWaitMs;
    this.tokenPage = tokenPage;
    this.openBrowser = openBrowser;
    this.deadline = Infinity;
    this.fetch = fetch;
    this.log = log;
    this.now = now;
    this.sleep = sleep;
    this.waitMs = waitMs;
    this.platform = platform;
  }

  remaining() {
    return this.deadline - this.now();
  }

  /** Runs a program. Git never waits for a login prompt, and nothing runs past the deploy time budget. */
  exec(command, args, options = {}) {
    const timeout = Math.max(1000, Math.min(options.timeout ?? 600_000, this.remaining()));
    const env = command === "git" ? { ...GIT_ENV, ...options.env } : options.env;
    return this.run(command, args, { ...options, timeout, ...(env ? { env } : {}) });
  }

  async command(command, args, options = {}) {
    const result = await this.exec(command, args, options);
    if (result.status !== 0) {
      const reason = stripAnsi(result.stderr).trim();
      if (command === "git" && /terminal prompts disabled|could not read (?:username|password)|authentication failed|permission denied \(publickey\)|invalid username or password|requested url returned error: 403/i.test(reason)) {
        throw new Error(GITHUB_SIGN_IN);
      }
      throw new Error(`${command} ${args[0] || ""} failed: ${reason.slice(-1500) || `exit code ${result.status}`}`);
    }
    return result;
  }

  /** Asks in a terminal a person types into. Anywhere else it stops at once and says what to ask the student. */
  async question(prompt, askStudent) {
    if (!this.interactive) throw new Error(`Ask the student: ${askStudent}`);
    return this.ask(prompt);
  }

  async git(args) {
    return (await this.command("git", args, { capture: true })).stdout.trim();
  }

  async status() {
    return gitChanges((await this.command("git", ["status", "--porcelain=v1", "-z"], { capture: true })).stdout);
  }

  config(required = false) {
    const path = join(this.root, LOCAL_CONFIG);
    if (!existsSync(path)) {
      if (required) throw new Error("No deploy method is selected. Run setup first.");
      return null;
    }
    let config;
    try {
      config = readJson(path);
    } catch {
      throw new Error(`Cannot read ${LOCAL_CONFIG}. Run setup again.`);
    }
    if (config.version !== 1 || !DEPLOY_METHODS.includes(config.method) || !TARGETS[config.target]
      || Object.keys(config).some((key) => /token|secret|password/i.test(key))) {
      throw new Error(`Check ${LOCAL_CONFIG}. It must not contain credentials.`);
    }
    return config;
  }

  saveConfig(method, target) {
    const directory = join(this.root, ".vercel");
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(this.root, LOCAL_CONFIG), `${JSON.stringify({ version: 1, method, target }, null, 2)}\n`, { mode: 0o600 });
  }

  target(options, config = this.config(false)) {
    if (options.target) return options.target;
    if (config?.target) return config.target;
    const path = join(this.root, "vercel.json");
    if (!existsSync(path)) return "web";
    const cloud = readJson(path);
    const target = Object.entries(TARGETS).find(([, value]) => value.output === cloud.outputDirectory)?.[0];
    if (!target) throw new Error("Check the output folder in vercel.json and the deploy target.");
    return target;
  }

  describeConfig(config) {
    if (!config) {
      this.log("Deployment method: not selected. Run setup --method git or setup --method api.");
      return;
    }
    const label = config.method === "git" ? "GitHub connection" : "Vercel REST API";
    this.log(`Deployment method: ${label} · target: ${config.target}`);
  }

  async check(target, method = null) {
    const selected = TARGETS[target];
    if (!selected) throw new Error("Check the deploy target.");
    if (target === "web") readWebProject(this.root);
    const pkg = readJson(join(this.root, "package.json"));
    if (!pkg.scripts?.[selected.script]) throw new Error(`Build command not found: ${selected.script}`);
    const node = (await this.command(process.execPath, ["--version"], { capture: true })).stdout.trim();
    if (!/^v\d+\.\d+\.\d+/.test(node) || Number(node.replace(/^v/, "").split(".")[0]) < 20) {
      throw new Error("Node.js 20 or newer is needed.");
    }
    if (method === "git") {
      await this.command("git", ["--version"], { capture: true });
      const tracked = (await this.command("git", ["ls-files", "-z"], { capture: true })).stdout.split("\0").filter(Boolean);
      const excluded = tracked.filter(excludedDeployPath);
      if (excluded.length) throw new Error(`Git is tracking files that must not be uploaded. Stop tracking them first:\n${excluded.join("\n")}`);
    }
    await this.command("pnpm", ["--version"], { capture: true });
    for (const args of [["typecheck"], ["ds:guard"], [selected.script]]) await this.command("pnpm", args);
    if (!existsSync(join(this.root, selected.output, "index.html"))) {
      throw new Error(`Build output not found: ${selected.output}/index.html`);
    }
    const walk = (directory) => {
      for (const item of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, item.name);
        if (item.isSymbolicLink()) throw new Error(`The build output contains a symbolic link: ${path}`);
        if (item.isDirectory()) walk(path);
        else if (/\.(html|css|js)$/.test(item.name)
          && /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?\/(?:assets|fonts)\//i.test(readFileSync(path, "utf8"))) {
          throw new Error(`The build output depends on a localhost asset: ${path}. Put the original asset in the project.`);
        }
      }
    };
    walk(join(this.root, selected.output));
    this.log(`Local deploy check passed: ${target} → ${selected.output}/. Check the screen and behavior separately.`);
  }

  async npmPath() {
    const prefix = (await this.command("npm", ["prefix", "-g"], { capture: true })).stdout.trim();
    if (!prefix || /[\r\n]/.test(prefix) || !isAbsolute(prefix)) throw new Error("Cannot find the npm global folder.");
    const bin = process.platform === "win32" ? prefix : join(prefix, "bin");
    const key = process.platform === "win32"
      ? Object.keys(this.env).find((name) => name.toLowerCase() === "path") || "Path"
      : "PATH";
    const paths = String(this.env[key] || "").split(delimiter);
    if (!paths.includes(bin)) this.env[key] = [bin, ...paths].join(delimiter);
  }

  async ensureVercel() {
    await this.npmPath();
    if ((await this.exec("vercel", ["--version"], { capture: true })).status !== 0) {
      this.log("Installing Vercel CLI → npm install -g vercel");
      await this.command("npm", ["install", "-g", "vercel"]);
      await this.npmPath();
      await this.command("vercel", ["--version"], { capture: true });
    }
  }

  async repository() {
    const branch = await this.git(["symbolic-ref", "--quiet", "--short", "HEAD"]);
    const url = await this.git(["remote", "get-url", "origin"]);
    const repo = githubRepository(url);
    const pushUrls = (await this.git(["remote", "get-url", "--push", "--all", "origin"])).split(/\r?\n/).filter(Boolean);
    if (pushUrls.length !== 1 || githubRepository(pushUrls[0]).key !== repo.key) {
      throw new Error("The fetch and push repositories of origin do not match. Check the Git remote yourself.");
    }
    if (!branch) throw new Error("Check the Git branch to deploy.");
    this.log(`Your repository: ${repo.url} · branch: ${branch}`);
    return { branch, repo };
  }

  async chooseRepository(url) {
    if (!url) {
      const current = await this.exec("git", ["remote", "get-url", "origin"], { capture: true });
      try {
        githubRepository(current.stdout.trim());
        return;
      } catch {
        url = await this.question("Your GitHub repository URL: ", ASK_REPO);
      }
    }
    const chosen = githubRepository(url);
    const existing = await this.exec("git", ["remote", "get-url", "origin"], { capture: true });
    if (existing.status === 0) {
      let same = false;
      try {
        same = githubRepository(existing.stdout.trim()).key === chosen.key;
      } catch {}
      if (same) return;
      if ((await this.exec("git", ["remote", "get-url", "upstream"], { capture: true })).status === 0) {
        throw new Error("An upstream remote already exists, so origin is not replaced automatically. Check the Git remote yourself.");
      }
      await this.command("git", ["remote", "rename", "origin", "upstream"]);
    }
    await this.command("git", ["remote", "add", "origin", chosen.url]);
  }

  configure(target) {
    const path = join(this.root, "vercel.json");
    const current = existsSync(path) ? readJson(path) : {};
    const next = vercelTargetConfig(target, current, target === "web" ? readWebProject(this.root).routes : []);
    if (JSON.stringify(current) !== JSON.stringify(next)) writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
  }

  checkCloudConfig(target) {
    const config = readJson(join(this.root, "vercel.json"));
    const expected = vercelTargetConfig(target, {}, target === "web" ? readWebProject(this.root).routes : []);
    for (const key of ["framework", "installCommand", "buildCommand", "outputDirectory"]) {
      if (config[key] !== expected[key]) throw new Error(`${key} in vercel.json does not match the ${target} deploy. Run setup --target ${target}.`);
    }
    if (JSON.stringify(config.rewrites || []) !== JSON.stringify(expected.rewrites || [])) {
      throw new Error("The Vercel rewrites do not match the approved web routes. Check the paths, then run setup.");
    }
  }

  async commit(options) {
    const changes = await this.status();
    if (!changes.length) return false;
    this.log("Changed files in Git:\n" + changes.map((change) => `${change.status} ${change.path}${change.from ? ` ← ${change.from}` : ""}`).join("\n"));
    const bad = changes.flatMap((change) => [change.path, change.from].filter(Boolean)).filter(excludedDeployPath);
    if (bad.length) throw new Error(`First remove the files that must not be deployed: ${bad.join(", ")}`);
    if (!options.all && !options.files.length
      && !/^y(es)?$/i.test(await this.question("Commit all the changed files shown above? [y/N]: ", "may all the changed files shown above be uploaded? If yes, run the same command again with --all."))) {
      throw new Error("No files were chosen to commit. Use --file <path> or --all.");
    }
    const selected = options.files.length
      ? changes.filter((change) => options.files.includes(change.path) || options.files.includes(change.from))
      : changes;
    if (options.files.some((path) => !selected.some((change) => change.path === path || change.from === path))) {
      throw new Error("--file must be the exact path of a changed file shown above.");
    }
    if (!selected.length) throw new Error("Choose the files to commit.");
    const paths = [...new Set(selected.flatMap((change) => [change.path, change.from].filter(Boolean)))];
    const staged = (await this.command("git", ["diff", "--cached", "--name-only", "-z"], { capture: true })).stdout.split("\0").filter(Boolean);
    if (staged.some((path) => !paths.includes(path))) {
      throw new Error("Files you did not choose are already staged. Check the Git index yourself.");
    }
    const message = options.message || await this.question("Commit message: ", "nothing — run the same command again with --message \"<a short description of the change>\".");
    if (!message.trim()) throw new Error("Enter a commit message.");
    await this.command("git", ["--literal-pathspecs", "add", "--", ...paths]);
    const pending = (await this.command("git", ["diff", "--cached", "--name-only", "-z"], { capture: true })).stdout;
    if (pending) await this.command("git", ["commit", "-m", message]);
    return Boolean(pending);
  }

  async push() {
    const { branch } = await this.repository();
    const head = await this.git(["rev-parse", "HEAD"]);
    const remote = await this.git(["ls-remote", "--heads", "origin", `refs/heads/${branch}`]);
    const before = remote.split(/\s+/)[0] || "";
    if (before === head) {
      this.log("No Git changes, so no new push or deploy was made.");
      return { pushed: false, head, branch };
    }
    if (before) {
      await this.command("git", ["fetch", "origin", branch]);
      if ((await this.exec("git", ["merge-base", "--is-ancestor", "FETCH_HEAD", "HEAD"], { capture: true })).status !== 0) {
        throw new Error("GitHub has newer changes or a conflict. Sync first. This script never force-pushes.");
      }
    }
    await this.command("git", ["push", "-u", "origin", "HEAD"]);
    this.log(`Git upload done: ${head}. The Vercel Ready status is checked separately.`);
    return { pushed: true, head, branch };
  }

  link() {
    const path = join(this.root, ".vercel/project.json");
    if (!existsSync(path)) throw new Error("No Vercel project is connected. Run setup first.");
    const link = readJson(path);
    if (![link.projectId, link.orgId].every((value) => typeof value === "string" && /^[A-Za-z0-9_-]+$/.test(value))) {
      throw new Error("Check the project and account info in .vercel/project.json.");
    }
    return link;
  }

  endpoint(path, params = {}, link = this.link()) {
    const query = new URLSearchParams(params);
    if (link.orgId.startsWith("team_")) query.set("teamId", link.orgId);
    return `${path}${query.size ? `?${query}` : ""}`;
  }

  async cliApi(endpoint) {
    const result = await this.command("vercel", ["api", endpoint, "--raw"], { capture: true });
    try {
      return JSON.parse(stripAnsi(result.stdout));
    } catch {
      throw new Error("Could not read the Vercel API response. Check the CLI version and access rights.");
    }
  }

  async gitProject(repo) {
    const link = this.link();
    const project = await this.cliApi(this.endpoint(`/v9/projects/${link.projectId}`));
    const cloud = project.link;
    if (project.id !== link.projectId || cloud?.type !== "github" || `${cloud.org}/${cloud.repo}`.toLowerCase() !== repo.key) {
      throw new Error("The Vercel project and Git origin point to different repositories. Check the project's Git connection.");
    }
    if (project.rootDirectory && project.rootDirectory !== ".") {
      throw new Error("The Vercel Root Directory must be the root of this starter project.");
    }
    if (!cloud.productionBranch) throw new Error("Set the Vercel Production Branch.");
    this.log(`Vercel project: ${project.name} · Production Branch: ${cloud.productionBranch}`);
    return project;
  }

  async waitForGitDeployment({ head, branch, since, expectedTarget }) {
    const { projectId } = this.link();
    const until = Math.min(this.now() + this.waitMs, this.deadline - 5000);
    while (this.now() <= until) {
      const result = await this.cliApi(this.endpoint("/v6/deployments", { projectId, limit: "100", since: String(since) }));
      if (!Array.isArray(result.deployments)) throw new Error("Could not read the Vercel deployment list.");
      const deployment = result.deployments
        .filter((item) => item.meta?.githubCommitSha === head
          && item.meta?.githubCommitRef === branch
          && item.source === "git"
          && item.target === expectedTarget)
        .sort((left, right) => Number(right.created) - Number(left.created))[0];
      if (deployment) {
        const ready = this.readyDeployment(deployment);
        if (ready) return { ...ready, head };
      }
      this.log("Checking the Vercel deploy status…");
      await this.sleep(5000);
    }
    throw new Error(STILL_WORKING);
  }

  readyDeployment(deployment) {
    const state = deployment.readyState || deployment.state;
    if (["ERROR", "CANCELED", "BLOCKED"].includes(state)) {
      throw new Error(`Vercel deploy failed: ${state}. Check the build log under Deployments in your Vercel project.`);
    }
    if (state !== "READY") return null;
    let url;
    try {
      url = new URL(`https://${deployment.url}`);
    } catch {
      throw new Error("Check the Vercel deploy URL.");
    }
    if (!deployment.url || url.hostname !== deployment.url || url.protocol !== "https:") {
      throw new Error("Check the Vercel deploy URL.");
    }
    const target = deployment.target === "production" ? "production" : "preview";
    this.log(`Vercel ${target === "production" ? "Production" : "Preview"} deploy Ready: ${url.href}`);
    return { url: url.href, state, target };
  }

  /** True when Vercel accepts the token, false when it refuses it (401/403). Network problems throw. */
  async tokenWorks(token) {
    try {
      await this.apiRequest(token, "/v2/user");
      return true;
    } catch (error) {
      if ([401, 403].includes(error.status)) return false;
      throw error;
    }
  }

  /** Opens the one-time browser page and waits for a token that Vercel accepts. */
  async promptToken() {
    const timeoutMs = Math.min(this.tokenWaitMs, Math.max(60_000, this.remaining() - 60_000));
    const page = await this.tokenPage({ verify: (value) => this.tokenWorks(value), timeoutMs });
    this.log("A browser window opened. Paste your Vercel token there, not in the chat. Waiting…");
    let opened = false;
    try { opened = await this.openBrowser(page.url, this.platform); } catch {}
    if (!opened) this.log(`The browser did not open by itself. Open this address in your browser: ${page.url}`);
    return page.token;
  }

  /** VERCEL_TOKEN → the token saved on this computer → the browser page. The token is never printed. */
  async token() {
    if (this.savedToken) return this.savedToken;
    const fromEnv = String(this.env.VERCEL_TOKEN || "").trim();
    if (fromEnv) {
      if (/\s/.test(fromEnv)) throw new Error("Enter one Vercel token without spaces.");
      this.savedToken = fromEnv;
      return fromEnv;
    }
    const path = tokenFile(this.env, this.platform);
    const saved = readSavedToken(path);
    if (saved) {
      if (await this.tokenWorks(saved)) {
        this.savedToken = saved;
        return saved;
      }
      forgetToken(path);
      this.log("The Vercel token saved on this computer does not work anymore (it may have expired). Make a new one in Vercel.");
    }
    const token = await this.promptToken();
    saveToken(path, token, this.platform);
    this.log("Your Vercel token works. It is saved on this computer, outside your project, so you will not be asked again. To remove it, ask the AI: \"Forget my Vercel token\".");
    this.savedToken = token;
    return token;
  }

  async apiRequest(token, path, { method = "GET", body, headers = {} } = {}) {
    const requestHeaders = { Authorization: `Bearer ${token}`, ...headers };
    let requestBody = body;
    if (body !== undefined && !Buffer.isBuffer(body)) {
      requestHeaders["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
    let response;
    try {
      response = await this.fetch(`https://api.vercel.com${path}`, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: AbortSignal.timeout(Math.max(1000, Math.min(2_147_000_000, this.remaining()))),
      });
    } catch (error) {
      if (error?.name === "TimeoutError" && this.remaining() <= 1000) throw new Error(STILL_WORKING);
      throw new Error("Could not reach the Vercel API. Check the network and try again.");
    }
    const text = await response.text();
    let data = {};
    if (text) {
      try { data = JSON.parse(text); } catch { data = {}; }
    }
    if (!response.ok) {
      const raw = String(data.error?.message || data.message || `HTTP ${response.status}`);
      const safe = raw.split(token).join("[hidden]").slice(0, 800);
      const error = new Error(`Vercel API request failed: ${safe}`);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async apiSetup(options, target) {
    const token = await this.token();
    let link = null;
    try { link = this.link(); } catch {}
    let project;
    if (link) {
      project = await this.apiRequest(token, this.endpoint(`/v9/projects/${link.projectId}`, {}, link));
      if (project.id !== link.projectId) throw new Error("The Vercel project response does not match the local project link.");
      if (options.project && options.project !== project.name) {
        throw new Error("--project does not match the locally connected Vercel project. Check .vercel/project.json yourself.");
      }
    } else {
      const name = options.project || await this.question("New Vercel project name: ", ASK_PROJECT);
      if (!validProjectName(name)) throw new Error("Use a lowercase Vercel project name with letters, numbers, dot, underscore or hyphen.");
      const teamId = String(this.env.VERCEL_TEAM_ID || "").trim();
      if (teamId && !/^team_[A-Za-z0-9_-]+$/.test(teamId)) throw new Error("Check VERCEL_TEAM_ID.");
      const query = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
      project = await this.apiRequest(token, `/v10/projects${query}`, { method: "POST", body: { name } });
      const orgId = teamId || project.accountId;
      if (![project.id, orgId].every((value) => typeof value === "string" && /^[A-Za-z0-9_-]+$/.test(value))) {
        throw new Error("Could not read the project and account IDs from Vercel.");
      }
      mkdirSync(join(this.root, ".vercel"), { recursive: true });
      writeFileSync(join(this.root, ".vercel/project.json"), `${JSON.stringify({ projectId: project.id, orgId }, null, 2)}\n`, { mode: 0o600 });
    }
    this.saveConfig("api", target);
    this.log(`Connected for Vercel REST API uploads: ${project.name}.`);
    return { status: "linked", target, project: project.name, method: "api" };
  }

  deploymentFiles(target) {
    const output = join(this.root, TARGETS[target].output);
    const files = [];
    const walk = (directory) => {
      for (const item of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, item.name);
        if (item.isSymbolicLink() || lstatSync(path).isSymbolicLink()) throw new Error(`The build output contains a symbolic link: ${path}`);
        if (item.isDirectory()) walk(path);
        else {
          const data = readFileSync(path);
          files.push({
            file: relative(output, path).replaceAll("\\", "/"),
            path,
            data,
            sha: createHash("sha1").update(data).digest("hex"),
            size: data.byteLength,
          });
        }
      }
    };
    walk(output);
    return files.sort((left, right) => left.file.localeCompare(right.file));
  }

  apiRoutes(target) {
    if (target !== "web") return undefined;
    const routes = readWebProject(this.root).routes.filter((route) => route !== "/");
    if (!routes.length) return undefined;
    return [
      { handle: "filesystem" },
      ...routes.map((source) => ({ src: apiRouteSource(source), dest: "/index.html" })),
    ];
  }

  async apiDeploy(target, production) {
    const token = await this.token();
    const link = this.link();
    const project = await this.apiRequest(token, this.endpoint(`/v9/projects/${link.projectId}`, {}, link));
    if (project.id !== link.projectId || !validProjectName(project.name)) throw new Error("Check the connected Vercel project.");
    const files = this.deploymentFiles(target);
    for (const file of files) {
      await this.apiRequest(token, this.endpoint("/v2/files", {}, link), {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "x-vercel-digest": file.sha,
          "x-vercel-size": String(file.size),
        },
        body: file.data,
      });
    }
    const body = {
      name: project.name,
      project: link.projectId,
      files: files.map(({ file, sha, size }) => ({ file, sha, size })),
      projectSettings: { framework: null },
      meta: { studentDeployMethod: "api", studentDeployTarget: target },
    };
    const routes = this.apiRoutes(target);
    if (routes) body.routes = routes;
    if (production) body.target = "production";
    const created = await this.apiRequest(token, this.endpoint("/v13/deployments", {}, link), { method: "POST", body });
    if (typeof created.id !== "string" || !/^[A-Za-z0-9_-]+$/.test(created.id)) {
      throw new Error("Could not read the new Vercel deployment ID.");
    }
    const until = Math.min(this.now() + this.waitMs, this.deadline - 5000);
    while (this.now() <= until) {
      const deployment = await this.apiRequest(token, this.endpoint(`/v13/deployments/${created.id}`, {}, link));
      const ready = this.readyDeployment({ ...deployment, target: production ? "production" : "preview" });
      if (ready) return ready;
      this.log("Checking the Vercel deploy status…");
      await this.sleep(5000);
    }
    throw new Error(STILL_WORKING);
  }

  async gitSetup(options, target) {
    await this.chooseRepository(options.repo);
    const { repo, branch } = await this.repository();
    await this.ensureVercel();
    if ((await this.exec("vercel", ["whoami"], { capture: true })).status !== 0) await this.command("vercel", ["login"]);
    if (!existsSync(join(this.root, ".vercel/project.json"))) await this.command("vercel", ["link"]);
    const link = this.link();
    const before = await this.cliApi(this.endpoint(`/v9/projects/${link.projectId}`));
    if (before.link
      && (before.link.type !== "github" || `${before.link.org}/${before.link.repo}`.toLowerCase() !== repo.key)) {
      throw new Error("The Vercel project is connected to a different Git repository. It is not replaced automatically.");
    }
    await this.commit(options);
    if ((await this.status()).length) throw new Error("Commit the remaining code changes first. Vercel is only connected to committed code.");
    await this.push();
    if (!before.link) {
      this.log(`Git repository to connect: ${repo.url}. Choose this repository when the CLI asks.`);
      await this.command("vercel", ["git", "connect", `https://github.com/${repo.owner}/${repo.name}.git`]);
    }
    const project = await this.gitProject(repo);
    this.saveConfig("git", target);
    this.log(`Connected. Current branch: ${branch}; production branch: ${project.link.productionBranch}. To change it, go to Vercel Settings → Environments → Production → Branch Tracking.\nsetup does not deploy from the CLI. Use publish on a work branch for Preview, then production on the production branch.`);
    return { status: "linked", target, project: project.name, method: "git" };
  }

  async gitDeploy(options, target, production) {
    const { repo, branch } = await this.repository();
    await this.ensureVercel();
    const project = await this.gitProject(repo);
    const productionBranch = project.link.productionBranch;
    if (production && branch !== productionBranch) {
      throw new Error("Run production on the Vercel Production Branch. The branch is not switched automatically.");
    }
    if (!production && branch === productionBranch) {
      throw new Error("Run publish on a work branch so Vercel creates a Preview. Use production on the Production Branch.");
    }
    await this.commit(options);
    if ((await this.status()).length) throw new Error("Commit the remaining code changes first. The commit to deploy is not settled yet.");
    const since = this.now();
    const pushed = await this.push();
    if (!pushed.pushed) return { status: "unchanged", head: pushed.head, method: "git" };
    return {
      status: "ready",
      method: "git",
      ...await this.waitForGitDeployment({ ...pushed, since, expectedTarget: production ? "production" : "preview" }),
    };
  }

  /** Fails at once, before any build, when setup needs an answer only the student can give. */
  async setupMethod(options) {
    const method = options.method || await this.question("Deployment method (git/api): ", ASK_METHOD);
    if (!DEPLOY_METHODS.includes(method)) throw new Error("The deploy method must be git or api.");
    if (this.interactive) return method;
    if (method === "api" && !options.project && !existsSync(join(this.root, ".vercel/project.json"))) {
      throw new Error(`Ask the student: ${ASK_PROJECT}`);
    }
    if (method === "git" && !options.repo) {
      const origin = await this.exec("git", ["remote", "get-url", "origin"], { capture: true });
      let github = false;
      try { github = origin.status === 0 && Boolean(githubRepository(origin.stdout.trim())); } catch {}
      if (!github) throw new Error(`Ask the student: ${ASK_REPO}`);
    }
    return method;
  }

  forgetSavedToken() {
    const removed = forgetToken(tokenFile(this.env, this.platform));
    this.log(removed
      ? "Your saved Vercel token was deleted from this computer."
      : "There is no saved Vercel token on this computer.");
    this.log(FORGET_HINT);
    return { status: removed ? "forgotten" : "none" };
  }

  async execute(options) {
    this.deadline = this.now() + this.budgetMs;
    if (options.mode === "help") {
      this.log([
        "Usage: deploy.sh / deploy.ps1 <check|setup|publish|production|forget-token> [options]",
        "Way 2 (Vercel only): setup --method api --project <name>; then publish (Preview) or production.",
        "Way 1 (GitHub + Vercel): setup --method git --repo <your GitHub URL>; publish on a work branch; production on the Production Branch.",
        "Both ways: add --target web|storybook. Git changes can use --message and --all/--file.",
        "For web, connect the approved pages in web.config.json first.",
        "The Vercel token is never a command-line option. It comes from VERCEL_TOKEN or a one-time browser page, and is saved on this computer outside the project. forget-token deletes it.",
      ].join("\n"));
      return { status: "help" };
    }
    if (options.mode === "forget-token") return this.forgetSavedToken();

    const current = this.config(false);
    const target = this.target(options, current);
    if (options.mode === "check") {
      this.describeConfig(current);
      await this.check(target, current?.method || null);
      return { status: "checked", target, method: current?.method || null };
    }

    if (options.mode === "setup") {
      const method = await this.setupMethod(options);
      if (method === "api") await this.token();
      await this.check(target, method);
      this.configure(target);
      if (method === "git") return this.gitSetup(options, target);
      return this.apiSetup(options, target);
    }

    const config = this.config(true);
    if (options.target && options.target !== config.target) {
      throw new Error(`This project is set up for ${config.target}. Run setup --method ${config.method} --target ${options.target} first.`);
    }
    this.checkCloudConfig(target);
    if (config.method === "api") await this.token();
    await this.check(target, config.method);
    if (config.method === "git") return this.gitDeploy(options, target, options.mode === "production");
    return { status: "ready", method: "api", ...await this.apiDeploy(target, options.mode === "production") };
  }
}
