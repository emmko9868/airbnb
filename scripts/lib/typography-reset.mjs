/** 학생이 직접 확인한 글자 선택 복원. 비TTY·판정 인자는 허용하지 않는다. */
import { readFileSync, existsSync, lstatSync, mkdirSync, openSync, closeSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import { resolve, relative, dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { spawnSync } from 'node:child_process';
import { digest } from './student-palette.mjs';
import { TYPOGRAPHY_FILE } from './typography-plan.mjs';

const phrase = 'reset text styles';
// 기존 한국어 확인 문구도 그대로 받는다(템플릿·한국어 안내서가 이 문구를 쓴다). 정확히 일치할 때만.
const phrases = [phrase, '글자 기본값 복원'];
const auditFile = '.ds/typography-reset.json';
const read = (path) => existsSync(path) ? readFileSync(path) : null;
function checked(root, filename) {
  if (typeof filename !== 'string' || !filename) throw new Error('A path setting needed for the reset is missing.');
  const path = resolve(root, filename), rel = relative(root, path);
  if (!rel || isAbsolute(rel) || rel.startsWith('..')) throw new Error('Reset paths must be inside the project.');
  let parent = root;
  for (const part of rel.split('/')) {
    parent = resolve(parent, part);
    const stat = lstatSync(parent, { throwIfNoEntry: false });
    if (stat?.isSymbolicLink()) throw new Error('Reset paths cannot use symbolic links.');
  }
  return path;
}
export async function runTypographyReset({ root, args = [], input = process.stdin, output = process.stdout, ask }) {
  if (args.length) throw new Error('Usage: pnpm ds:reset-typography (no auto-approve options)');
  if (!input.isTTY || !output.isTTY) throw new Error('The student must run this themselves in an interactive terminal. Text style reset is refused from an AI shell, a pipe or a redirect.');
  root = realpathSync(resolve(root));
  const configPath = checked(root, 'ds.config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const selectionPath = checked(root, TYPOGRAPHY_FILE);
  if (!existsSync(selectionPath)) { output.write('Text styles already use the defaults. Nothing was changed.\n'); return; }
  if (["tokenValue", "tokenName"].some((key) => (config.ownership?.[key] ?? "figma") !== "figma")) throw new Error('Text style reset needs tokenValue/tokenName=figma ownership.');
  if (!existsSync(checked(root, join(dirname(config.output.source), 'figma-variables.json')))) throw new Error('The Figma source is missing, so we cannot check that your colors are kept. Restore the source and run this again.');
  const outputs = [TYPOGRAPHY_FILE, config.output.tokensCss, config.output.tokensJson, config.output.provenance, auditFile].map((p) => checked(root, p));
  if (new Set(outputs).size !== outputs.length) throw new Error('Two reset output paths are the same.');
  const inputs = [configPath, ...[config.output.source, config.output.semantic ?? '.ds/semantic.json', config.output.lock, join(dirname(config.output.source), 'figma-variables.json')].map((p) => checked(root, p))];
  // source 경로는 프로젝트 기준이며 dirname도 같은 기준으로 계산한다.
  const snapshot = () => [...new Set([...inputs, ...outputs])].map((path) => { checked(root, path); return [path, read(path)?.toString('base64') ?? null]; });
  const before = snapshot(), beforeHash = digest(before);
  const previous = new Map(outputs.map((path) => [path, read(path)]));
  output.write('This removes all approved text style choices and regenerates the project\'s default font, sizes, weights and line heights.\nColor roles, the Figma source and existing plans are kept. The defaults follow the current source and the starter token rules.\nDo not let the AI run this for you. A terminal connection alone does not prove that a person is typing.\n');
  let rl, answer;
  try {
    if (!ask) {
      rl = createInterface({ input, output, terminal: true });
      const abort = new AbortController();
      rl.on('close', () => abort.abort());
      rl.on('SIGINT', () => rl.close());
      ask = (prompt) => rl.question(prompt, { signal: abort.signal });
    }
    answer = await ask(`If you checked this yourself and agree, type "${phrase}" (anything else cancels): `);
  } finally { rl?.close(); }
  if (!phrases.includes(answer)) { output.write('Text style reset canceled. Nothing was changed.\n'); return; }
  const lockPath = checked(root, '.ds/typography-reset.lock');
  let lock;
  try { lock = openSync(lockPath, 'wx'); }
  catch { throw new Error('Another text style reset is running, or an old lock file was left behind. Existing files are kept.'); }
  try {
    if (digest(snapshot()) !== beforeHash) throw new Error('Inputs, choices or generated files changed while you were confirming. Review again.');
    try {
      rmSync(selectionPath);
      const generated = spawnSync(process.execPath, [fileURLToPath(new URL('../ds.mjs', import.meta.url)), 'tokens'], { cwd: root, encoding: 'utf8', env: { ...process.env, DS_ROOT: root } });
      if (generated.status !== 0) throw new Error(`Token regeneration failed: ${generated.stdout ?? ''}${generated.stderr ?? ''}`);
      const afterInputs = inputs.map((path) => { checked(root, path); return [path, read(path)?.toString('base64') ?? null]; });
      if (JSON.stringify(afterInputs) !== JSON.stringify(inputs.map((path) => before.find(([p]) => p === path)))) throw new Error('Token inputs changed during regeneration.');
      const auditPath = checked(root, auditFile);
      mkdirSync(dirname(auditPath), { recursive: true });
      writeFileSync(auditPath, JSON.stringify({ schema_version: 1, decision: 'reset', confirmation: answer, confirmed_at: new Date().toISOString(), previous_selection_hash: digest(previous.get(selectionPath).toString('utf8')), input_hash: beforeHash }, null, 2) + '\n');
      output.write('The student confirmed. Text styles are back to the defaults and were regenerated with ds:tokens.\nThe old text style plan was kept. To apply it again, check its source, hashes and approval status. Also check the real screen and the component visual review again.\n');
    } catch (error) {
      for (const [path, content] of previous) {
        checked(root, path);
        if (content === null) rmSync(path, { force: true });
        else writeFileSync(path, content);
      }
      throw error;
    }
  } finally { closeSync(lock); rmSync(lockPath, { force: true }); }
}
