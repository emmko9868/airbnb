/**
 * 컴포넌트 분류 — "우리에게 뭐가 있고 뭐가 없나" 를 카테고리로 본다.
 *
 * vibe-design-starterkit 의 Vibe Dictionary v0.4 에서 가져온 생각:
 * 컴포넌트 목록을 나열하는 것과 **분류 체계 안에서 빈 칸을 보는 것**은 다르다.
 * Carbon 의 components overview 가 하는 일이 후자다.
 *
 * 분류는 이름 매칭이다 — LLM 을 쓰지 않는다. 틀리면 taxonomy.json 을 고치면 되고,
 * 그게 LLM 이 매번 다르게 분류하는 것보다 낫다.
 */

/** "Button Group" / "button-group" / "ButtonGroup" → "buttongroup" */
function norm(s) {
  return String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function buildTaxonomy(raw) {
  const categories = (raw?.categories ?? []).map((c) => ({
    name: c.name,
    items: c.items ?? [],
    normalized: new Map((c.items ?? []).map((i) => [norm(i), i])),
  }));
  return categories;
}

/**
 * 컴포넌트 이름 → { category, item } | null
 *
 * 1) 정확 일치  2) 항목명이 컴포넌트 이름에 포함 (긴 항목 우선 — "ButtonGroup" 이
 *    "Button" 보다 먼저 걸려야 한다)
 */
export function classify(name, categories) {
  const n = norm(name);
  if (!n) return null;
  for (const c of categories) {
    const hit = c.normalized.get(n);
    if (hit) return { category: c.name, item: hit, exact: true };
  }
  let best = null;
  for (const c of categories) {
    for (const [key, item] of c.normalized) {
      if (key.length < 3 || !n.includes(key)) continue;
      if (!best || key.length > best.key.length) best = { category: c.name, item, key, exact: false };
    }
  }
  return best ? { category: best.category, item: best.item, exact: false } : null;
}

/**
 * 커버리지 표. 카테고리마다 있는 것/없는 것을 센다.
 * @returns {{ rows, unclassified, totals }}
 */
export function coverage(specs, categories) {
  const found = new Map(); // category → Map(item → componentName)
  const unclassified = [];
  for (const s of specs) {
    const hit = classify(s.name, categories);
    if (!hit) {
      unclassified.push(s.name);
      continue;
    }
    if (!found.has(hit.category)) found.set(hit.category, new Map());
    found.get(hit.category).set(hit.item, { name: s.name, exact: hit.exact });
  }
  const rows = categories.map((c) => {
    const have = found.get(c.name) ?? new Map();
    return {
      category: c.name,
      total: c.items.length,
      haveCount: have.size,
      have: [...have].map(([item, v]) => ({ item, name: v.name, exact: v.exact })),
      missing: c.items.filter((i) => !have.has(i)),
    };
  });
  const totals = {
    items: categories.reduce((n, c) => n + c.items.length, 0),
    have: rows.reduce((n, r) => n + r.haveCount, 0),
    categoriesWithAny: rows.filter((r) => r.haveCount > 0).length,
    categories: categories.length,
  };
  return { rows, unclassified, totals };
}
