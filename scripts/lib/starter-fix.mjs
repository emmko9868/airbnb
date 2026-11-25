/** 강사의 비시각 감사 수정 전용. 새 부품/학생 Figma 구현의 대체 출처가 아니다. */
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const audits = new Map([["FileUploader", "A02"], ["Tabs", "A03"], ["ContentSwitcher", "A03"], ["TreeView", "A03"], ["Tile", "A10"], ["DatePicker", "A11"], ["ProgressBar", "A12"]]);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const need = (ok, message) => { if (!ok) throw new Error(`starter-fix: ${message}`); };

export function starterFixDeclaration(root, plan, sourceUrl) {
  const m = plan.metadata, audit = audits.get(m.component);
  need(audit, "강사 비시각 수정은 감사에서 확인한 기존 7개 부품에만 허용됩니다. ProgressIndicator A08 크기 외관 수정은 별도 시각 입력이 필요합니다.");
  need(!m.source_url && !sourceUrl, "Figma URL 요청을 스타터 수정으로 대체할 수 없습니다.");
  need(m.source_ref === `docs/plans/ds-audit-2026-10.md#${audit}` && m.fix_scope === "behavior-accessibility" && m.visual_changes === "false", "감사 출처·behavior-accessibility 범위·visual_changes: false가 필요합니다.");
  const auditPath = join(root, "docs/plans/ds-audit-2026-10.md");
  need(existsSync(auditPath) && realpathSync(auditPath) === resolve(realpathSync(root), "docs/plans/ds-audit-2026-10.md"), "저장소의 실제 감사 근거가 필요합니다.");
  const canonical = `docs/plans/components/${m.component}.md`;
  need(plan.path === resolve(root, canonical) && realpathSync(plan.path) === resolve(realpathSync(root), canonical), "해당 부품의 정식 계획 경로만 허용하며 링크는 금지합니다.");
  need(existsSync(join(root, `src/components/${m.component}/${m.component}.tsx`)), "기존 스타터 구현이 없습니다. 새 부품은 이 경로로 만들 수 없습니다.");
  need(m.instructor_approval === `docs/plans/starter-fixes/${m.component}.approval.json`, "정식 강사 승인 기록 경로를 지정하세요.");
  return { component: m.component, audit, approvalPath: join(root, m.instructor_approval) };
}

/** CSS와 토큰 입력/생성 값을 승인 시점에 고정한다. TSX 외관은 인간 원본 대조도 필요하다. */
export function starterVisualHash(root, component) {
  const files = [];
  const visit = (path, cssOnly = false) => {
    if (!existsSync(path)) return;
    const stat = lstatSync(path);
    need(!stat.isSymbolicLink(), "시각 기준에 심볼릭 링크를 사용할 수 없습니다.");
    if (stat.isDirectory()) for (const name of readdirSync(path).sort()) visit(join(path, name), cssOnly);
    else if (!cssOnly || path.endsWith(".css")) files.push([relative(root, path), hash(readFileSync(path))]);
  };
  visit(join(root, `src/components/${component}`), true);
  visit(join(root, "src/tokens"));
  for (const path of [".ds/source.json", ".ds/semantic.json", ".ds/tokens.json"]) visit(join(root, path));
  need(files.some(([name]) => name.endsWith(`${component}.css`)) && files.some(([name]) => name === "src/tokens/tokens.css"), "기존 부품 CSS와 토큰 CSS 기준이 필요합니다.");
  return hash(JSON.stringify(files));
}

export function readStarterFixApproval(root, plan) {
  const declaration = starterFixDeclaration(root, plan);
  const path = declaration.approvalPath;
  need(existsSync(path) && realpathSync(path) === resolve(realpathSync(root), relative(root, path)), "강사가 직접 남긴 승인 기록이 없거나 링크 경로입니다.");
  const content = readFileSync(path, "utf8");
  const record = JSON.parse(content);
  need(record.schema_version === 1 && record.role === "instructor" && record.decision === "approved" && typeof record.reviewer === "string" && record.reviewer.trim() && typeof record.evidence === "string" && record.evidence.trim() && Number.isFinite(Date.parse(record.approved_at)), "강사·검토 근거·승인 시각·결정 기록이 필요합니다.");
  need(record.component === declaration.component && record.audit_id === declaration.audit && String(record.revision) === plan.metadata.revision && record.plan_hash === plan.digest && record.fix_scope === "behavior-accessibility" && record.visual_changes === false, "강사 승인과 계획의 대상·revision·해시·범위가 다릅니다.");
  const visualHash = starterVisualHash(root, declaration.component);
  need(record.visual_hash === visualHash, "승인 이후 CSS/토큰이 바뀌었습니다. 비시각 수정 범위를 벗어났습니다.");
  return { path, digest: hash(content), visualHash };
}

export function assertStarterFixUnchanged(root, plan) {
  const approval = readStarterFixApproval(root, plan);
  need(approval.digest === plan.starterFix.digest, "실행 중 강사 승인 기록이 바뀌었습니다.");
}

export function starterFixFileAllowed(component, path) {
  return ["tsx", "stories.tsx", "test.tsx"].some((suffix) => path === `src/components/${component}/${component}.${suffix}`);
}
