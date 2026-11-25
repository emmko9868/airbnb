/** get_variable_defs의 Effect 원문만 변환한다. 모르는 효과는 부분 적용하지 않는다. */
const number = String.raw`[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?`;
const shadow = new RegExp(String.raw`^Effect\(\s*type:\s*(DROP_SHADOW|INNER_SHADOW),\s*color:\s*(#[0-9a-fA-F]{8}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{3}),\s*offset:\s*\(\s*(${number})\s*,\s*(${number})\s*\),\s*radius:\s*(${number})\s*,\s*spread:\s*(${number})\s*\)$`);
export const isFigmaEffect = (value) => typeof value === 'string' && /^\s*Effect\s*\(/i.test(value);
export function convertFigmaEffect(raw) {
  const parts = String(raw).trim().split(/;\s*/);
  const values = [];
  for (const part of parts) {
    const match = part.trim().match(shadow);
    if (!match) {
      const type = part.match(/type:\s*([A-Z_]+)/)?.[1] ?? '알 수 없는 형식';
      return { value: null, reason: `${type}: 해석할 수 없는 Effect입니다. 원본을 확인하세요.` };
    }
    const [, type, color, ...dimensions] = match;
    const numbers = dimensions.map(Number);
    if (!numbers.every(Number.isFinite) || numbers[2] < 0) return { value: null, reason: 'Effect의 위치·흐림·퍼짐 숫자를 확인하세요. 흐림은 음수일 수 없습니다.' };
    values.push(`${type === 'INNER_SHADOW' ? 'inset ' : ''}${numbers.map((n) => `${n}px`).join(' ')} ${color}`);
  }
  return { value: values.join(', '), reason: null };
}
