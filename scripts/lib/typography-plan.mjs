/** Figma 글자 값 중 학생이 선택한 기존 Layout 토큰만 바꾼다. */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { mergeFigmaVariables, variableDefsToCollections } from "./figma-merge.mjs";
import { normalizeLineHeight } from "./figma-typography.mjs";
import { digest, resolveStudentPalette } from "./student-palette.mjs";
import { cssVarFor } from "./css.mjs";
import { assertStudentPlanApproved, parseTokenPlan, serializeTokenPlan, tokenPlanHash, tokenPlanSourceIdentity } from "./token-plan.mjs";

export const TYPOGRAPHY_FILE = ".ds/typography.json";
const need = (ok, message) => { if (!ok) throw new Error(`Text style plan: ${message}`); };
const fieldFor = (name) => name === "--font-sans" ? "family" : /^--text-(?:body-1|body-2|title)$/.test(name) ? "size" : /^--font-weight-[a-z][a-z-]*$/.test(name) ? "weight" : /^--leading-(?:tight|normal)$/.test(name) ? "lineHeight" : null;
const targetTokens = (tokens) => tokens.filter((t) => t.layer === "layout" && fieldFor(cssVarFor(t.category, t.name)));
export const typographyBaseHash = (tokens) => digest(targetTokens(tokens).map((t) => ({ category: t.category, name: t.name, value: t.value })).sort((a, b) => a.name.localeCompare(b.name)));
export function typographySourceHash(figma) {
  need(figma && figma.raw && typeof figma.raw === "object" && !Array.isArray(figma.raw), "There is no imported text style source. Import it with ds:figma.");
  return digest({ file_key: figma.file_key ?? "", nodes: [...(figma.nodes ?? [])].sort(), typography: variableDefsToCollections(figma.raw).typography });
}
export function readTypographyContext(root) {
  const config = JSON.parse(readFileSync(resolve(root, "ds.config.json"), "utf8"));
  need(["tokenValue", "tokenName"].every((key) => (config.ownership?.[key] ?? "figma") === "figma"), "This needs tokenValue/tokenName=figma ownership.");
  const sourcePath = resolve(root, config.output.source), figmaPath = resolve(dirname(sourcePath), "figma-variables.json");
  need(existsSync(figmaPath), "Import your Figma first.");
  const figma = JSON.parse(readFileSync(figmaPath, "utf8"));
  const source = existsSync(sourcePath) ? JSON.parse(readFileSync(sourcePath, "utf8")) : null;
  const tokens = resolveStudentPalette(mergeFigmaVariables(source, figma).source, figma, config).tokens;
  return { config, figma, tokens, sourceHash: typographySourceHash(figma), baseHash: typographyBaseHash(tokens) };
}
function fieldValue(style, field, confirmation, context) {
  const raw = String(style.fields[field] ?? ""), seen = new Set();
  let value = raw, referenced = false;
  while (Object.hasOwn(context.figma.raw, value)) {
    need(!seen.has(value), "A text style reference loops back to itself."); seen.add(value);
    const next = context.figma.raw[value];
    need(typeof next === "string" || typeof next === "number", "Cannot find one clear value for the text style reference.");
    value = String(next); referenced = true;
  }
  if (referenced) need(confirmation === value, `Reference ${raw} really means ${value}. Write ${value} in the confirmation column.`);
  else need(confirmation === "-", "For a direct value, put - in the confirmation column.");
  if (field === "family") {
    need(value && !/^_?font[-_]?family(?:$|[/_-])|^var\(|^\{/i.test(value) && /^[\p{L}\p{N} _.,-]+$/u.test(value), "Check the real font name. A reference name or custom CSS is not a font.");
    return `${JSON.stringify(value)}, system-ui, -apple-system, 'Segoe UI', sans-serif`;
  }
  const number = Number(value);
  need(Number.isFinite(number) && number > 0 && (field !== "weight" || number <= 1000), "Font size and weight must be the real numbers from the source.");
  return field === "size" ? `${number}px` : String(number);
}

export function validateTypographySelections(selections, context) {
  need(Array.isArray(selections) && selections.length > 0, "List at least one existing token to change. If you change nothing, you don't need a plan.");
  const targets = new Map(targetTokens(context.tokens).map((t) => [cssVarFor(t.category, t.name), t]));
  const styles = variableDefsToCollections(context.figma.raw).typography.styles;
  const seen = new Set();
  return selections.map((row) => {
    need(row && Object.keys(row).every((key) => ["token", "style", "field", "raw", "confirmation", "reason"].includes(key)), "This mapping field is not supported.");
    need(targets.has(row.token) && !seen.has(row.token) && fieldFor(row.token) === row.field, `Unknown, new, or duplicate token, or the wrong field for it: ${row.token}`); seen.add(row.token);
    need(typeof row.raw === "string" && typeof row.confirmation === "string" && typeof row.reason === "string" && row.reason.trim(), "Each row needs the source value, the unit or reference check, and a reason.");
    const candidates = [...new Map(styles.filter((s) => s.name === row.style && s.fields && String(s.fields[row.field] ?? "") === row.raw).map((s) => [s.raw, s])).values()];
    need(candidates.length === 1, `The style or source value was not found, or was found more than once: ${row.style}`);
    const style = candidates[0];
    let value;
    if (row.field === "lineHeight") {
      let normalized = normalizeLineHeight(style.fields, style.name);
      if (normalized.status === "normalized") need(row.confirmation === "-", "This line height already has a known unit. Do not reinterpret it.");
      else {
        need(["percent", "px", "multiplier"].includes(row.confirmation), "A line height with an unknown unit needs the unit the student checked (percent, px or multiplier) and a reason.");
        let size = String(style.fields.size ?? ""), visited = new Set();
        while (Object.hasOwn(context.figma.raw, size)) { need(!visited.has(size), "A font size reference loops back to itself."); visited.add(size); size = String(context.figma.raw[size]); }
        normalized = normalizeLineHeight({ ...style.fields, size, lineHeightUnit: row.confirmation.toUpperCase() }, style.name);
      }
      need(normalized.status === "normalized" && Number.isFinite(normalized.value), "Cannot work out the line height unit.");
      value = String(normalized.value);
    } else value = fieldValue(style, row.field, row.confirmation, context);
    return { ...row, value };
  });
}

function selectionsOf(plan) {
  need(!/미확정|미답변|TODO|REPLACE|\bTBD\b|\|\s*open\s*\|/i.test(plan.body), "Answer the plan's questions and check the source values first.");
  need((plan.body.match(/<!-- typography-mappings:start -->/g) ?? []).length === 1 && (plan.body.match(/<!-- typography-mappings:end -->/g) ?? []).length === 1, "The plan needs exactly one text style mapping table.");
  const body = plan.body.match(/<!-- typography-mappings:start -->\s*([\s\S]*?)\s*<!-- typography-mappings:end -->/)?.[1];
  need(body, "The text style mapping table is missing.");
  const rows = [];
  for (const [index, line] of body.trim().split(/\r?\n/).entries()) {
    need(/^\s*\|.*\|\s*$/.test(line), "The text style mapping must be a Markdown table with 6 columns.");
    const cells = line.trim().split("|").slice(1, -1).map((s) => s.trim());
    need(cells.length === 6, "The text style mapping needs 6 columns: token, style, field, source value, check, reason.");
    if (index === 0 || cells.every((c) => /^[-:]+$/.test(c))) continue;
    rows.push(Object.fromEntries(["token", "style", "field", "raw", "confirmation", "reason"].map((key, i) => [key, cells[i]])));
  }
  return rows;
}
function validatePlan(plan, context) {
  tokenPlanSourceIdentity(plan.metadata.source_url, context.figma);
  need(plan.metadata.font_check === "confirmed", "The student must check that the font is installed, and know that the browser shows a fallback font if it is not.");
  return validateTypographySelections(selectionsOf(plan), context);
}
export function prepareTypographyPlan(text, context) {
  const plan = parseTokenPlan(text, "typography");
  need(plan.metadata.status === "review-required", "Only a plan in review (status: review-required) can be prepared. It is never approved automatically.");
  const changes = validatePlan(plan, context);
  plan.metadata.typography_hash = context.sourceHash;
  plan.metadata.base_hash = context.baseHash;
  plan.metadata.content_hash = tokenPlanHash(plan);
  return { text: serializeTokenPlan(plan), changes };
}
export function validateApprovedTypographyPlan(text, context) {
  const plan = parseTokenPlan(text, "typography");
  assertStudentPlanApproved(plan);
  need(plan.metadata.typography_hash === context.sourceHash && plan.metadata.base_hash === context.baseHash, "The text style source or base token hash does not match. Review it as a new revision.");
  return { metadata: plan.metadata, changes: validatePlan(plan, context) };
}
export function applyTypographyOverrides(tokens, figma, config, data) {
  need(data && typeof data === "object" && !Array.isArray(data), "The saved text style choice file is broken. It will not quietly go back to the defaults.");
  need(["tokenValue", "tokenName"].every((key) => (config.ownership?.[key] ?? "figma") === "figma"), "This needs tokenValue/tokenName=figma ownership.");
  need(data.schema_version === 1 && /^[a-f0-9]{64}$/.test(data.plan_hash ?? "") && /^[1-9]\d*$/.test(String(data.revision)), "Check the format of the saved approved choices.");
  need(data.typography_hash === typographySourceHash(figma) && data.base_hash === typographyBaseHash(tokens), "The source or base tokens behind the saved text style choices changed. Approve the text style plan again.");
  tokenPlanSourceIdentity(data.source_url, figma);
  const changes = validateTypographySelections(data.selections, { figma, tokens });
  const byToken = new Map(changes.map((c) => [c.token, c]));
  return tokens.map((token) => {
    const change = byToken.get(cssVarFor(token.category, token.name));
    return change ? { ...token, value: change.value, source: "declared", confidence: 1, reason: `학생 승인 글자 선택: ${change.style} / ${change.reason}` } : token;
  });
}
