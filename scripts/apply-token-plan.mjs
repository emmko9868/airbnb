#!/usr/bin/env node
/** 학생이 승인한 Markdown만 semantic 입력으로 반영한다. 모델/네트워크 호출 없음. */
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync, rmSync, realpathSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readStudentTokenContext, tokenPlanPath, prepareTokenPlan, validateApprovedTokenPlan } from './lib/token-plan.mjs';
import { readTypographyContext, prepareTypographyPlan, validateApprovedTypographyPlan, TYPOGRAPHY_FILE } from './lib/typography-plan.mjs';
const root = realpathSync(process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : fileURLToPath(new URL('..', import.meta.url)));
function outputPath(filename) {
  const path = resolve(root, filename);
  let parent = existsSync(path) ? path : dirname(path);
  while (!existsSync(parent)) parent = dirname(parent);
  for (const target of [path, realpathSync(parent)]) {
    const rel = relative(realpathSync(root), target);
    if (isAbsolute(rel) || rel.startsWith('..')) throw new Error('Output files must be inside the project.');
  }
  return path;
}
try {
  const args = process.argv.slice(2);
  const prepare = args.includes('--prepare');
  if (args.some((arg) => arg.startsWith('--') && arg !== '--prepare') || args.filter((arg) => !arg.startsWith('--')).length > 1) throw new Error('Usage: pnpm ds:apply-token-plan [docs/plans/tokens.md] [--prepare]');
  const path = tokenPlanPath(root, args.find((arg) => !arg.startsWith('--')));
  const text = readFileSync(path, 'utf8');
  const typography = /^kind:\s*typography\s*$/m.test(text);
  const readContext = typography ? readTypographyContext : readStudentTokenContext;
  const context = readContext(root);
  const contextHash = (c) => typography ? c.sourceHash + c.baseHash : c.paletteHash;
  if (prepare) {
    const prepared = typography ? prepareTypographyPlan(text, context) : null;
    const next = prepared ? prepared.text : prepareTokenPlan(text, context);
    writeFileSync(path, next);
    if (prepared) {
      console.log('Updated the text style plan\'s source, base token and content hashes. status is review-required. Summarize the changes for the student in the chat and ask them to approve with a choice (Approve revision N / Change something).');
      for (const row of prepared.changes) console.log(`  ${row.token} → ${row.value} (${row.style})`);
    } else console.log('Updated the plan\'s contrast table and its palette and content hashes. status is review-required. Summarize the changes for the student in the chat and ask them to approve with a choice (Approve revision N / Change something).');
  } else {
    const result = typography ? validateApprovedTypographyPlan(text, context) : validateApprovedTokenPlan(text, context);
    const semanticPath = outputPath(typography ? TYPOGRAPHY_FILE : context.config.output.semantic ?? '.ds/semantic.json');
    const outputs = [semanticPath, ...['tokensCss', 'tokensJson', 'provenance'].map((key) => outputPath(context.config.output[key]))];
    const previous = new Map(outputs.map((file) => [file, existsSync(file) ? readFileSync(file) : null]));
    const data = typography ? { schema_version: 1, $comment: '학생 승인 글자 계획의 선택. 원시값은 Figma 원본에서 재검증함. AI 직접 수정 금지.', typography_hash: context.sourceHash, base_hash: context.baseHash, plan_hash: result.metadata.content_hash, revision: Number(result.metadata.revision), source_url: result.metadata.source_url, selections: result.changes.map(({ value, ...row }) => row) } : { $comment: '학생 승인 Markdown을 scripts/apply-token-plan.mjs가 반영함. AI 직접 수정 금지.', $paletteHash: context.paletteHash, $planHash: result.metadata.content_hash, $revision: Number(result.metadata.revision), $colors: Object.fromEntries([...new Set(Object.values(result.mappings))].sort().map((name) => [name, context.tokens.find((t) => t.layer === 'primitive' && t.category === 'COLOR' && t.name === name)?.value])), ...result.mappings };
    const temporary = semanticPath + `.tmp-${process.pid}`;
    try {
      if (readFileSync(path, 'utf8') !== text || contextHash(readContext(root)) !== contextHash(context)) throw new Error('The approved plan or its source changed while this was running.');
      mkdirSync(dirname(semanticPath), { recursive: true });
      writeFileSync(temporary, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
      renameSync(temporary, semanticPath);
      const generated = spawnSync(process.execPath, [fileURLToPath(new URL('./ds.mjs', import.meta.url)), 'tokens'], { cwd: root, encoding: 'utf8', env: { ...process.env, DS_ROOT: root } });
      if (generated.status !== 0) throw new Error(`Token regeneration failed: ${generated.stdout ?? ''}${generated.stderr ?? ''}`);
      if (readFileSync(path, 'utf8') !== text || contextHash(readContext(root)) !== contextHash(context)) throw new Error('The approved plan or its source changed during regeneration.');
      if (typography) {
        console.log(`Applied the approved text style plan and regenerated with ds:tokens. Tokens changed: ${result.changes.length}. All other tokens stay the same.`);
        for (const row of result.changes) console.log(`  ${row.token} → ${row.value}`);
        console.log('If a font is not installed, a fallback font is shown instead. Check the real screen and the component review versions.');
      } else {
        process.stdout.write(generated.stdout);
        console.log(`Applied the approved plan. Contrast warnings: ${result.contrasts.filter((row) => ['warn', 'unverified'].includes(row.status)).length}. Review them with pnpm ds:guard and on the real screen.`);
      }
    } catch (error) {
      for (const [file, content] of previous) {
        if (content == null) { if (existsSync(file)) rmSync(file, { force: true }); }
        else writeFileSync(file, content);
      }
      throw error;
    } finally { rmSync(temporary, { force: true }); }
  }
} catch (error) { console.error(`Token plan rejected: ${error.message}`); process.exitCode = 1; }
