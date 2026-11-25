/** 글자 역할 대비. 명시된 토큰만 해석하며 색을 보정하지 않는다. */
import { parseColorA, contrast } from './color.mjs';
import { cssVarFor } from './css.mjs';
export function textContrasts(tokens) {
  const byVar = new Map(tokens.map((t) => [cssVarFor(t.category, t.name), t]));
  const semantics = tokens.filter((t) => t.category === 'COLOR' && t.layer === 'semantic');
  const byName = new Map(semantics.map((t) => [t.name, t]));
  const resolve = (t, seen = new Set()) => {
    if (!t || seen.has(t)) return null;
    const ref = String(t.value).match(/^var\((--[\w-]+)\)$/)?.[1];
    return ref ? resolve(byVar.get(ref), new Set([...seen, t])) : parseColorA(t.value);
  };
  const over = (fg, bg) => ({ rgb: fg.rgb.map((v, i) => v * fg.alpha + bg.rgb[i] * (1 - fg.alpha)), alpha: 1 });
  const canvas = resolve(byName.get('bg'));
  const rows = [];
  const pairs = new Set();
  const add = (fgName, bgName, exempt = false) => {
    if (!byName.has(fgName) || !byName.has(bgName) || pairs.has(`${fgName}/${bgName}`)) return;
    pairs.add(`${fgName}/${bgName}`);
    let fg = resolve(byName.get(fgName));
    let bg = resolve(byName.get(bgName));
    if (bg && bg.alpha < 1) bg = canvas?.alpha === 1 ? over(bg, canvas) : null;
    if (fg && bg && fg.alpha < 1) fg = over(fg, bg);
    const ratio = fg && bg ? contrast(fg.rgb, bg.rgb) : null;
    rows.push({ foreground: fgName, background: bgName, ratio, minimum: exempt ? null : 4.5, status: exempt ? 'exempt' : ratio == null ? 'unverified' : ratio >= 4.5 ? 'pass' : 'warn' });
  };
  for (const fg of semantics.filter((t) => t.name === 'text' || t.name.startsWith('text-'))) {
    for (const bg of ['bg', 'surface', 'surface-raised']) add(fg.name, bg, fg.name === 'text-disabled');
  }
  for (const fg of semantics.filter((t) => t.name.startsWith('on-'))) {
    const bg = fg.name.slice(3);
    for (const suffix of ['', '-hover', '-active']) add(fg.name, bg + suffix);
  }
  for (const fg of ['danger', 'warning', 'success', 'info']) for (const bg of ['bg', 'surface']) add(fg, bg);
  return rows;
}
export function contrastWarnings(tokens) {
  return textContrasts(tokens).filter((r) => r.status === 'warn' || r.status === 'unverified').map((r) => ({ target: `${r.foreground}/${r.background}`, detail: r.ratio == null ? '대비 미검증: alias 또는 불투명한 배경을 확인하세요.' : `글자 역할 대비 ${r.ratio.toFixed(2)}:1 — 4.5:1 미만, 실제 사용 배경/크기를 검토하세요.` }));
}
