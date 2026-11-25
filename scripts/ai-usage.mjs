/** Qwen 로컬 기록만 읽는 사용량 집계. 네트워크·모델 호출 없음. */
import { readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const fields = ['requests', 'inputTokens', 'cachedTokens', 'outputTokens', 'thoughtsTokens', 'totalTokens'];
const number = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
const empty = () => Object.fromEntries(fields.map((key) => [key, 0]));
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
function localDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseOptions(args) {
  const options = { rates: Object.create(null) };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') { options.json = true; continue; }
    if (arg === '--help') { options.help = true; continue; }
    if (!['--since', '--session', '--credits-per-1k'].includes(arg)) throw new Error(`Unknown option: ${arg}`);
    const value = args[++i];
    if (!value || value.startsWith('--')) throw new Error(`${arg} needs a value.`);
    if (arg === '--since') {
      if (!validDate(value)) throw new Error('--since must be a real date written as YYYY-MM-DD.');
      options.since = value;
    } else if (arg === '--session') options.session = value;
    else {
      const match = value.match(/^(.+)=([0-9]+(?:\.[0-9]+)?)$/);
      if (!match || !Number.isFinite(Number(match[2]))) throw new Error('Write the rate as model=number, where the number is 0 or more.');
      options.rates[match[1]] = Number(match[2]);
    }
  }
  return options;
}

function readLines(file, warnings) {
  let text;
  try { text = readFileSync(file, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const rows = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try { rows.push(JSON.parse(line)); }
    catch { warnings.push(`${file}:${index + 1} skipped a line that is not valid JSON.`); }
  }
  return rows;
}

export function collectUsage(qwenDir, options = {}) {
  const warnings = [];
  let files = [];
  try { files = readdirSync(join(qwenDir, 'usage')).filter((name) => /^token-usage-\d{4}-\d{2}\.jsonl$/.test(name)).sort(); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const requests = [];
  const ids = new Set();
  const covered = new Map();
  const keyOf = (row) => JSON.stringify([row.sessionId, row.model]);
  for (const file of files) {
    for (const row of readLines(join(qwenDir, 'usage', file), warnings)) {
      if (!row || typeof row.id !== 'string' || typeof row.sessionId !== 'string' || typeof row.model !== 'string' || !validDate(row.localDate) || !Number.isFinite(row.inputTokens)) {
        warnings.push(`${file}: skipped a request record with missing required fields.`); continue;
      }
      if (ids.has(row.id)) continue;
      ids.add(row.id);
      covered.set(keyOf(row), (covered.get(keyOf(row)) ?? 0) + 1);
      requests.push({ ...row, requests: 1, source: 'request', date: row.localDate });
    }
  }
  // 세션 파일은 누적 스냅샷일 수 있으므로 세션별 마지막 시점만 사용한다.
  const sessions = new Map();
  for (const row of readLines(join(qwenDir, 'usage_record.jsonl'), warnings)) {
    if (!row || typeof row.sessionId !== 'string' || !row.models || typeof row.models !== 'object' || !localDate(row.timestamp)) {
      warnings.push('Skipped a session summary with missing required fields.'); continue;
    }
    const previous = sessions.get(row.sessionId);
    if (!previous || Number(new Date(row.timestamp)) >= Number(new Date(previous.timestamp))) sessions.set(row.sessionId, row);
  }
  const fallback = [];
  const overlaps = [];
  // 요약의 sessionId는 요청 로그의 sessionId와 다를 수 있다. 같은 모델의
  // 누적 요약을 별도 세션으로 더하면 이중 집계하므로 요청 원장을 우선한다.
  const ledgerModels = new Set(requests.map((row) => row.model));
  const excluded = [];
  for (const session of sessions.values()) {
    for (const [model, usage] of Object.entries(session.models)) {
      if (!usage || typeof usage !== 'object') continue;
      const row = { ...usage, model, sessionId: session.sessionId, date: localDate(session.timestamp), source: 'session' };
      if (covered.has(keyOf(row))) overlaps.push(row);
      else if (ledgerModels.has(model)) excluded.push(row);
      else fallback.push(row);
    }
  }
  const matches = (row) => (!options.since || row.date >= options.since) && (!options.session || row.sessionId === options.session);
  const rows = [...requests, ...fallback].filter(matches);
  const excludedByModel = new Map();
  for (const row of excluded.filter(matches)) {
    const group = excludedByModel.get(row.model) ?? { count: 0, requests: 0 };
    group.count++; group.requests += number(row.requests);
    excludedByModel.set(row.model, group);
  }
  for (const [model, group] of excludedByModel) warnings.push(`${model}: did not add ${group.count} session ${group.count === 1 ? 'summary' : 'summaries'} (${group.requests} requests) whose session ID is different from the request log, because they may be duplicates. Each model is counted once per request ID. Missing requests are not restored.`);
  if (rows.some((row) => row.source === 'session')) warnings.push('Sessions and models with no request records were filled in from session summaries. Their date is the day the session ended, so daily usage cannot be rebuilt.');
  const selectedKeys = new Set(rows.map(keyOf));
  for (const summary of overlaps) {
    if (!selectedKeys.has(keyOf(summary))) continue;
    const count = covered.get(keyOf(summary));
    if (summary.requests > count) warnings.push(`${summary.sessionId} / ${summary.model}: the session summary shows ${summary.requests} requests, but there are only ${count} request records. They are not added twice, so some usage may be missing.`);
  }
  const rates = options.rates ?? {};
  const estimate = Object.keys(rates).length > 0;
  function aggregate(list) {
    const totals = empty();
    for (const row of list) for (const key of fields) totals[key] += number(row[key]);
    if (estimate) {
      totals.estimatedCredits = list.every((row) => Object.hasOwn(rates, row.model))
        ? list.reduce((sum, row) => sum + number(row.totalTokens) * rates[row.model], 0) / 1000 : null;
    }
    return totals;
  }
  function group(field) {
    const groups = new Map();
    for (const row of rows) { const key = row[field]; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(row); }
    return [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([key, list]) => ({ [field]: key, ...aggregate(list) }));
  }
  if (estimate && rows.some((row) => !Object.hasOwn(rates, row.model))) warnings.push('Some models have no rate, so their groups have no credit estimate.');
  return {
    totals: aggregate(rows), byDate: group('date'), bySession: group('sessionId'), byModel: group('model'),
    sources: { requestRows: rows.filter((row) => row.source === 'request').length, sessionModelRows: rows.filter((row) => row.source === 'session').length },
    notes: ['Input, cached, output and thinking are shown exactly as recorded, and one may include another. They are not added up to make the total.', 'Credits are an estimate: your rate for each model × recorded totalTokens / 1000. This is not an official bill.', 'For a model with a request log, the request log is used and session summaries with other IDs are not added. Only models with no request log at all are filled in from session summaries.'],
    warnings,
  };
}

export function formatUsage(result) {
  if (result.sources.requestRows + result.sources.sessionModelRows === 0) return ['No usage records yet. Chat in Qwen Code first, then ask the AI to show your usage again.', ...result.warnings.map((message) => `Warning: ${message}`)].join('\n') + '\n';
  const credits = Object.hasOwn(result.totals, 'estimatedCredits');
  const header = ['Group', 'Requests', 'Input', 'Cached', 'Output', 'Thinking', 'Recorded total tokens', ...(credits ? ['Estimated credits'] : [])];
  const values = (row) => [...fields.map((field) => row[field]), ...(credits ? [row.estimatedCredits === null ? 'no rate' : Number(row.estimatedCredits.toFixed(4))] : [])];
  const table = (title, groups, key) => [title, `| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...groups.map((row) => `| ${[String(row[key]).replaceAll('|', '\\|'), ...values(row)].join(' | ')} |`)].join('\n');
  return [
    table('Overall', [{ name: 'Total', ...result.totals }], 'name'), table('By date', result.byDate, 'date'),
    table('By session', result.bySession, 'sessionId'), table('By model', result.byModel, 'model'),
    ...result.notes.filter((_, index) => credits || index === 0), ...result.warnings.map((message) => `Warning: ${message}`),
  ].join('\n\n') + '\n';
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const options = parseOptions(process.argv.slice(2));
    if (options.help) console.log('Usage: pnpm ai:usage [--since YYYY-MM-DD] [--session ID] [--json] [--credits-per-1k model=rate] (you can repeat --credits-per-1k)');
    else {
      const result = collectUsage(join(homedir(), '.qwen'), options);
      process.stdout.write(options.json ? JSON.stringify(result, null, 2) + '\n' : formatUsage(result));
    }
  } catch (error) { console.error(`Could not build the usage report: ${error.message}`); process.exitCode = 1; }
}
