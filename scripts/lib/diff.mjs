/**
 * lock 비교. DSP 비교 모델의 "추가·변경·동일·미포함 + 필드별 이전/현재"
 * 를 파일 기반으로 옮긴 것이다.
 *
 * 픽셀 비교가 아니라 **구조·값 비교**다. Figma 렌더와 브라우저 렌더를 픽셀로
 * 맞추는 것은 폰트 래스터화 때문에 영구 false positive 가 된다.
 */
import { createHash } from "node:crypto";

export function buildLock({ tokens, components, level, sourceHash }) {
  const t = {};
  for (const row of tokens) {
    t[`${row.category}:${row.name}`] = {
      layer: row.layer,
      value: row.value,
      source: row.source,
      confidence: row.confidence,
      // Figma 변수 id — 이름이 바뀐 것을 추적한다(tokenName 소유권).
      ...(row.figmaId ? { id: row.figmaId } : {}),
    };
  }
  const c = {};
  for (const spec of components) {
    c[spec.name] = {
      nodeId: spec.nodeId,
      variantCount: spec.variantCount,
      props: spec.props.map((p) => `${p.codeName}:${p.kind}:${(p.options ?? []).map((o) => o.code).join("|")}`).sort(),
    };
  }
  return { version: 1, level, sourceHash, generatedAt: new Date().toISOString(), tokens: t, components: c };
}

export function hashOf(value) {
  return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex").slice(0, 16);
}

function diffMaps(before, after, fields) {
  const added = [];
  const removed = [];
  const changed = [];
  let same = 0;
  for (const [key, next] of Object.entries(after)) {
    const prev = before[key];
    if (!prev) {
      added.push({ key, after: next });
      continue;
    }
    const delta = {};
    for (const f of fields) {
      const a = JSON.stringify(prev[f]);
      const b = JSON.stringify(next[f]);
      if (a !== b) delta[f] = { before: prev[f], after: next[f] };
    }
    if (Object.keys(delta).length) changed.push({ key, delta });
    else same += 1;
  }
  for (const key of Object.keys(before)) {
    if (!(key in after)) removed.push({ key, before: before[key] });
  }
  return { added, removed, changed, same };
}

export function diffLock(previous, next) {
  const empty = { tokens: {}, components: {} };
  const before = previous ?? empty;
  return {
    levelChanged: before.level !== next.level ? { before: before.level, after: next.level } : null,
    tokens: diffMaps(before.tokens ?? {}, next.tokens ?? {}, ["layer", "value", "source"]),
    components: diffMaps(before.components ?? {}, next.components ?? {}, ["nodeId", "variantCount", "props"]),
  };
}

export function formatDiff(d) {
  const lines = [];
  if (d.levelChanged) lines.push(`Level: ${d.levelChanged.before ?? "(none)"} → ${d.levelChanged.after}`);
  for (const [label, group] of [["Tokens", d.tokens], ["Components", d.components]]) {
    const { added, removed, changed, same } = group;
    lines.push(`${label}: added ${added.length} · changed ${changed.length} · removed ${removed.length} · unchanged ${same}`);
    for (const a of added.slice(0, 20)) lines.push(`  + ${a.key}${a.after?.value ? ` = ${a.after.value}` : ""}`);
    for (const c of changed.slice(0, 20)) {
      for (const [f, v] of Object.entries(c.delta)) {
        lines.push(`  ~ ${c.key} .${f}: ${JSON.stringify(v.before)} → ${JSON.stringify(v.after)}`);
      }
    }
    for (const r of removed.slice(0, 20)) lines.push(`  - ${r.key}`);
    const extra = added.length + changed.length + removed.length - 60;
    if (extra > 0) lines.push(`  … and ${extra} more`);
  }
  return lines.join("\n");
}
