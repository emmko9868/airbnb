#!/usr/bin/env node
/** 사람이 강사 계획을 검토한 후 직접 실행한다. 모델·API 호출 없음. */
import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { assertPlanUnchanged, readPlanDocument, requirePlanApproval } from "./lib/component-plan.mjs";
import { starterFixDeclaration, starterVisualHash } from "./lib/starter-fix.mjs";

try {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("강사 본인이 대화형 터미널에서 직접 실행해야 합니다. AI·파이프·무인 승인은 금지합니다.");
  const [filename, reviewerFlag, reviewer, evidenceFlag, evidence, ...extra] = process.argv.slice(2);
  if (!filename || reviewerFlag !== "--reviewer" || !reviewer?.trim() || evidenceFlag !== "--evidence" || !evidence?.trim() || extra.length) throw new Error('사용법: node scripts/approve-starter-fix.mjs docs/plans/components/<Name>.md --reviewer "강사 이름" --evidence "검토 근거"');
  const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : fileURLToPath(new URL("..", import.meta.url));
  const plan = requirePlanApproval(readPlanDocument(root, filename));
  if (plan.metadata.kind !== "component" || plan.metadata.source_kind !== "starter-fix") throw new Error("starter-fix 컴포넌트 계획만 강사 승인할 수 있습니다.");
  const fix = starterFixDeclaration(root, plan), visualHash = starterVisualHash(root, fix.component);
  console.log(`강사 수정 승인: ${fix.component} / ${fix.audit} / revision ${plan.metadata.revision}\n계획 해시 ${plan.digest}\n시각 기준 ${visualHash}\nCSS·토큰·새 외관 변경 금지. TSX의 실제 외관 보존도 검토해야 합니다.`);
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let answer;
  try { answer = await rl.question(`계획 전체와 비시각 수정 범위를 직접 확인했다면 "${fix.component} 비시각 수정 승인"을 입력하세요: `); } finally { rl.close(); }
  if (answer !== `${fix.component} 비시각 수정 승인`) throw new Error("승인하지 않았습니다. 파일을 쓰지 않습니다.");
  assertPlanUnchanged(plan);
  if (starterVisualHash(root, fix.component) !== visualHash) throw new Error("확인 중 시각 기준이 바뀌었습니다. 재검토하세요.");
  mkdirSync(dirname(fix.approvalPath), { recursive: true });
  if (realpathSync(dirname(fix.approvalPath)) !== resolve(realpathSync(root), relative(root, dirname(fix.approvalPath)))) throw new Error("승인 폴더의 링크 경로는 금지합니다.");
  const record = { schema_version: 1, role: "instructor", decision: "approved", reviewer, evidence, approved_at: new Date().toISOString(), component: fix.component, audit_id: fix.audit, revision: plan.metadata.revision, plan_hash: plan.digest, fix_scope: "behavior-accessibility", visual_changes: false, visual_hash: visualHash };
  writeFileSync(fix.approvalPath, JSON.stringify(record, null, 2) + "\n", { flag: "wx" });
  console.log("강사 승인 기록을 저장했습니다. 기존 승인 기록은 덮어쓰지 않습니다. 수정 후 동작·접근성·외관을 다시 검수하세요.");
} catch (error) { console.error(`강사 승인 차단: ${error.message}`); process.exitCode = 1; }
