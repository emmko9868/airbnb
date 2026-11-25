/**
 * 파이프라인 메시지의 영어판.
 *
 * 추론 근거(reason)·생성 기록(notes)·가드 결과(detail)·소유권 제안은 실행할 때 값이 끼워진
 * 한국어 문장으로 만들어진다. 문서(Storybook)를 EN 으로 볼 때를 위해 **조각 단위**로 옮긴다 —
 * 근거끼리 이어 붙인 문장("… (누락 역할 보충)")도 조각마다 바뀐다.
 *
 * 새 메시지를 추가하면 여기에도 규칙을 넣는다. 빠뜨리면 `scripts/tests/i18n.test.mjs` 가 잡는다.
 * 순수 모듈이다 — 터미널 출력(ds.mjs·figma-tokens.mjs)도 같은 규칙으로 영어로 찍는다.
 */

const HANGUL = /[ㄱ-ㆎ가-힣]/;

/** [찾을 조각, 바꿀 글자]. 긴 것·구체적인 것부터 둔다. */
const RULES = [
  // ── 사다리 단계 ──
  [/L3 — 3계층 모두 선언됨 \(추론 없음\)/g, "L3 — all three tiers declared (no inference)"],
  [/L2a — primitive 까지 선언, semantic 을 추론/g, "L2a — primitives declared, semantics inferred"],
  [/L2b — semantic 만 선언, primitive 를 역추출/g, "L2b — only semantics declared, primitives extracted"],
  [/L1 — 이름 없는 hex 만 있어 전 계층을 생성/g, "L1 — only unnamed hex values, all tiers generated"],
  [/L0 — 입력 없음\. seed 로 전체 합성/g, "L0 — no input, everything synthesized from a seed"],

  // ── 생성 기록(notes) ──
  [/primitive·semantic 이 모두 확인됨\. 선언된 계층은 그대로 사용\./g, "Both primitive and semantic tiers found. Declared tiers are used as they are."],
  [/primitive·semantic 을 alias 구조로 구분함\(선언 없음\)\. ds\.config\.json 에 컬렉션을 적으면 추론이 사라진다\./g, "Primitive and semantic separated by alias structure (nothing declared). List the collections in ds.config.json to remove this inference."],
  [/semantic 계층이 없어 primitive (\d+)개에서 역할 (\d+)개를 추론함\./g, "No semantic tier: inferred $2 roles from $1 primitives."],
  [/primitive 계층이 없어 semantic 이 물고 있던 hex (\d+)개를 primitive 로 역추출하고 semantic 을 alias 로 재작성함\./g, "No primitive tier: extracted $1 hex values held by semantics into primitives and rewrote the semantics as aliases."],
  [/변수가 없어 Paint Style (\d+)개에서 primitive 를 만들고 semantic 을 추론함\./g, "No variables: built primitives from $1 Paint Styles and inferred semantics."],
  [/입력이 전혀 없어 seed 하나로 primitive (\d+)개 \+ semantic (\d+)개를 합성함\./g, "No input at all: synthesized $1 primitives and $2 semantics from a single seed."],
  [/채우지 못한 역할: (.+?) — 원본에 해당 색이 없다\./g, "Roles left unfilled: $1 — the source has no matching color."],
  [/layout 계층에서 빠진 (\d+)개를 기본 세트로 보충함\./g, "Filled $1 missing layout tokens from the default set."],
  [/component 계층이 없어 컴포넌트 (\d+)개분 토큰을 합성함\(검토 필요\)\./g, "No component tier: synthesized tokens for $1 components (needs review)."],

  // ── 역할 추론 근거(roles) ──
  [/bg 보다 밝은 무채색이 없어 bg 와 동일/g, "Same as bg (no neutral lighter than bg)"],
  [/bg 보다 밝은 무채색/g, "Neutral lighter than bg"],
  [/bg 와 동일 \(분리된 표면 단계가 없음\)/g, "Same as bg (no separate surface step)"],
  [/무채색 계열 중 가장 밝음/g, "Lightest in the neutral family"],
  [/무채색 계열 중 가장 어두움/g, "Darkest in the neutral family"],
  [/명도 ([\d.]+) 근처/g, "Nearest to lightness $1"],
  [/이름 힌트\((.+?)\) 계열의 기준 스텝/g, "Base step of the family hinted by the name ($1)"],
  [/이름 단서 없음 — 채도 높고 중간 밝기인 색/g, "No name hint — the most saturated mid-lightness color"],
  [/primary 램프의 한 단계 어두운 스텝/g, "One step darker in the primary ramp"],
  [/primary 램프의 두 단계 어두운 스텝/g, "Two steps darker in the primary ramp"],
  [/primary 보다 더 어두운 동일 계열/g, "An even darker color in the primary family"],
  [/primary 보다 어두운 동일 계열/g, "A darker color in the primary family"],
  [/primary 대비 ([\d.]+):1 로 최대/g, "Highest contrast against primary ($1:1)"],
  [/hue (\d+)~(\d+)° 에 전용 계열이 없어 primary 계열 재사용/g, "No dedicated family in hue $1–$2°, so the primary family is reused"],
  [/hue (\d+)~(\d+)° 계열의 기준 스텝/g, "Base step of the hue $1–$2° family"],

  // ── 분류 근거(ladder) ──
  [/ds\.config\.json tiers\.(\w+) 에 선언된 컬렉션\/패턴/g, "Collection or pattern declared in ds.config.json tiers.$1"],
  [/alias 사슬 깊이 (\d+) — primitive→semantic→component 로 본다/g, "Alias chain depth $1 — read as primitive→semantic→component"],
  [/alias 이고 다른 변수가 참조함/g, "Alias, referenced by other variables"],
  [/alias 이고 참조되지 않음/g, "Alias, not referenced"],
  [/색이 아닌 카테고리는 layout 계층/g, "Non-color categories belong to the layout tier"],
  [/이름에 컴포넌트 세그먼트/g, "The name contains a component segment"],
  [/원시값이고 다른 변수가 참조함/g, "Raw value, referenced by other variables"],
  [/원시값이고 참조되지 않음/g, "Raw value, not referenced"],
  [/Figma Paint Style 값에서 hue·명도로 이름을 생성/g, "Named by hue and lightness from a Figma Paint Style value"],
  [/입력이 없어 seed (\S+) 로 합성/g, "Synthesized from seed $1 (no input)"],
  [/(\w+) 기본 seed/g, "$1 default seed"],
  [/ \(누락 역할 보충\)/g, " (filling a missing role)"],
  [/기본 layout 세트에서 보충함/g, "Filled from the default layout set"],
  [/component 계층이 없어 컴포넌트 인벤토리에서 합성함/g, "Synthesized from the component inventory (no component tier)"],
  [/semantic 이 직접 물고 있던 hex 를 hue·명도로 이름 붙여 승격/g, "Promoted a hex value held directly by a semantic token, named by hue and lightness"],
  [/ → primitive\((.+?)\) 참조로 재작성/g, " → rewritten to reference primitive($1)"],

  // ── 소유권(ownership) ──
  [/Figma 에서 이름이 "(.+?)" 로 바뀌었다 — tokenName=(\w+) 라 "(.+?)" 을 유지한다\./g, 'Renamed to "$1" in Figma — tokenName=$2, so "$3" is kept.'],
  [/Figma 에 새로 생겼다\((.+?)\) — tokenValue=code 라 추가하지 않는다\./g, "New in Figma ($1) — tokenValue=code, so it is not added."],
  [/Figma 값 (\S+) — tokenValue=(\w+) 라 (\S+) 을 유지한다\./g, "Figma value $1 — tokenValue=$2, so $3 is kept."],
  [/( ?)\(tokenValue=(\w+): 유지 중인 값\)/g, "$1(tokenValue=$2: kept value)"],
  [/Figma 에서 사라졌지만 tokenValue=(\w+) 라 유지/g, "Removed in Figma but kept (tokenValue=$1)"],
  [/Figma 에서 사라졌다 — tokenValue=(\w+) 라 유지한다\./g, "Removed in Figma — tokenValue=$1, so it is kept."],
  [/"(.+?)" 는 primitive 에 없다\. 있는 이름: /g, '"$1" is not a primitive. Available: '],
  [/\.ds\/semantic\.json 에서 사람이 지정\(Figma·추론과 같음\)/g, "Set by a person in .ds/semantic.json (same as Figma and inference)"],
  [/\.ds\/semantic\.json 에서 사람이 지정 \((\w+) (\S+) 대신\)/g, "Set by a person in .ds/semantic.json (instead of $1 $2)"],
  [/\.ds\/semantic\.json 에서 사람이 지정/g, "Set by a person in .ds/semantic.json"],
  [/사람 지정 (\S+) — semanticMapping=figma 라 Figma 선언 (\S+) 를 쓴다\./g, "A person set $1 — semanticMapping=figma, so the Figma declaration $2 is used."],
  [/Figma 선언 (\S+) — semanticMapping=(\w+) 라 사람이 지정한 (\S+) 를 쓴다\./g, "Figma declares $1 — semanticMapping=$2, so the person's choice $3 is used."],
  [/Figma 속성 "(.+?)" 가 구현에 없다 — componentApi=figma 라 구현에 추가해야 한다\./g, 'Figma property "$1" is missing from the implementation — componentApi=figma, so add it to the implementation.'],
  [/Figma 속성 "(.+?)" 가 구현에 없다 — componentApi=(\w+) 라 story·Code Connect 에서 뺀다\./g, 'Figma property "$1" is missing from the implementation — componentApi=$2, so it is left out of stories and Code Connect.'],
  [/구현 타입과 Figma variant 가 다르다\(Figma 에만: (.+?) \/ 코드에만: (.+?)\) — variantMatrix=figma 라 구현을 Figma 에 맞춰야 한다\./g, "The implementation type and Figma variants differ (Figma only: $1 / code only: $2) — variantMatrix=figma, so update the implementation to match Figma."],
  [/Figma 에만 있는 값 (.+?) — variantMatrix=(\w+) 라 구현 타입\((.+?)\)을 쓴다\./g, "Values only in Figma: $1 — variantMatrix=$2, so the implementation type ($3) is used."],
  [/Figma 설명이 다르다\("(.+?)"\) — description=(\w+) 라 사람이 쓴 설명을 쓴다\./g, 'The Figma description differs ("$1") — description=$2, so the human-written description is used.'],
  [/알 수 없는 필드다\. (.+?) 중 하나여야 한다\./g, "Unknown field. It must be one of $1."],
  [/"(.+?)" 는 소유자가 아니다\. figma \/ code \/ human 중 하나여야 한다\./g, '"$1" is not an owner. It must be figma / code / human.'],
  [/ 설명$/g, " description"],

  // ── 가드 결과(detail) ──
  [/(\S+) 는 primitive 다\. semantic\/layout 을 참조해야 한다\./g, "$1 is a primitive. Reference semantic or layout tokens instead."],
  [/값이 (\S+) 다\. primitive 를 가리켜야 한다\./g, "The value is $1. It must point to a primitive."],
  [/(\S+) — primitive 는 hexcode 를 직접 가져야 한다\./g, "$1 — primitives must hold a hex value directly."],
  [/^순환: /g, "Cycle: "],
  [/(\S+) 가 정의되지 않았다\./g, "$1 is not defined."],
  [/필수 역할이 없다\. primitive 에 해당 색이 없거나 추론이 실패했다\./g, "Required role is missing. There is no matching primitive color, or inference failed."],
  [/대비 ([\d.]+):1 — 본문 기준 4\.5:1 미만이다\./g, "Contrast $1:1 — below the 4.5:1 minimum for body text."],
  [/소문자·숫자·하이픈만 쓴다\./g, "Use lowercase letters, digits and hyphens only."],
  [/(\S+) — 토큰\(var\(--…\)\)을 써야 한다\./g, "$1 — use a token (var(--…))."],
  [/(\S+) — 토큰을 써야 한다\. Figma 색을 근사하지 않는다\./g, "$1 — use a token; never approximate a Figma color."],
  [/Code Connect 파일이 없다 — Figma↔코드 매핑의 앵커가 빠졌다\./g, "No Code Connect file — the Figma↔code anchor is missing."],
  [/autodocs 태그가 없다\./g, "The autodocs tag is missing."],
  [/play 함수가 하나도 없다\./g, "There is no play function."],
  [/(\S+) 가 토큰에 없다 — 렌더가 조용히 깨진다\./g, "$1 is not a token — rendering breaks silently."],
  [/(\S+) 와 (\S+) 가 같은 변수로 나간다 — 뒤의 값만 남는다\./g, "$1 and $2 become the same variable — only the last value survives."],
  [/\(규칙 실행 실패\)/g, "(rule failed to run)"],
  // ── 글자 역할 대비(token-contrast, 학생 팔레트의 G8) ──
  [/글자 역할 대비 ([\d.]+):1 — 4\.5:1 미만, 실제 사용 배경\/크기를 검토하세요\./g, "Text role contrast $1:1 — below 4.5:1. Check it on the real background and text size."],
  [/대비 미검증: alias 또는 불투명한 배경을 확인하세요\./g, "Contrast not checked: check the alias or the see-through background."],
  // ── 학생 팔레트 차단(ds.mjs → G15) ──
  [/학생 색 교체는 tokenValue\/tokenName=figma가 필요합니다\./g, "Replacing the sample colors with yours needs tokenValue/tokenName=figma."],
  [/다른 팔레트의 매핑입니다\. docs\/plans\/tokens\.md를 재승인하세요\./g, "This mapping belongs to a different palette. Approve docs/plans/tokens.md again."],
  [/학생 Figma 선언 역할과 이전 사람 매핑이 충돌합니다\. 토큰 계획을 다시 검토하세요\./g, "A role declared in your Figma clashes with an earlier mapping made by a person. Review the token plan again."],
  // ── 그림자(figma-effects) ──
  [/해석할 수 없는 Effect입니다\. 원본을 확인하세요\./g, "This Effect cannot be read. Check the original value."],
  [/알 수 없는 형식/g, "unknown type"],
  [/Effect의 위치·흐림·퍼짐 숫자를 확인하세요\. 흐림은 음수일 수 없습니다\./g, "Check the Effect's offset, blur and spread numbers. Blur cannot be negative."],
  // ── 학생 팔레트(student-palette) ──
  [/학생 팔레트: 선언\/승인 역할만 적용/g, "Student palette: only declared or approved roles are applied"],
  [/샘플 색을 제거했습니다\. 누락 역할은 학생 승인이 필요합니다\./g, "Sample colors were removed. Missing roles need your approval."],
  [/학생 Figma의 정확한 원시 색/g, "Exact raw color from your Figma"],
  [/학생 Figma의 semantic 선언/g, "Semantic declared in your Figma"],
  [/학생 Figma의 component 선언 — /g, "Component declared in your Figma — "],
  [/같은 값의 semantic ([\w-]+)/g, "same value as semantic $1"],
  [/같은 색의 semantic 이 여러 개입니다\((.+?)\)\. ([\w-]+) 에 연결했습니다\. Figma alias 를 확인하세요\./g, "Several semantic colors have the same value ($1). Linked to $2. Check the Figma alias."],
  [/같은 색\((.+?)\)의 semantic 이 없어 component 토큰을 만들지 않았습니다\. Figma 에서 이 색이 semantic 변수를 거치게 하세요\./g, "No semantic color has this value ($1), so the component token was not created. In Figma, make this color go through a semantic variable."],
  [/기존\/가져온 비색상 layout 값/g, "Existing or imported non-color layout value"],
  [/비색상 layout 보충/g, "Filled non-color layout value"],
  [/기본 layout 보충/g, "Filled default layout value"],
  // ── 학생이 승인한 글자 계획(typography-plan) ──
  [/학생 승인 글자 선택: /g, "Text style chosen in the student's approved plan: "],

  // ── 글자 크기 체계(figma-typography) ──
  [/텍스트 스타일 "([^"]*)" 이 다른 값으로 한 번 더 있습니다\. 첫 값만 글자 체계에 넣었습니다\./g, 'Text style "$1" appears again with different values. Only the first was added to the type scale.'],
  [/텍스트 스타일 "([^"]*)" 의 글자 크기를 읽지 못해 글자 체계에 넣지 않았습니다\./g, 'Could not read the size of text style "$1", so it was not added to the type scale.'],
  [/텍스트 스타일 "([^"]*)" 의 줄높이 단위를 알 수 없어 줄높이는 넣지 않았습니다\(/g, 'The line-height unit of text style "$1" is unknown, so no line height was added ('],
  [/퍼센트인지 픽셀인지 확인할 단위가 없습니다\. 값 크기만으로 추측하지 않습니다\./g, "No unit says whether it is a percent or pixels. The size of the number alone is not used to guess."],
  [/줄높이 값\/참조\/auto의 단위를 확인하세요\./g, "Check the unit of the line-height value, reference or auto."],
  [/줄높이 값의 단위와 명시한 단위가 충돌합니다\./g, "The unit in the line-height value clashes with the stated unit."],
  [/지원하지 않는 줄높이 단위입니다\./g, "This line-height unit is not supported."],
  [/스타일 이름의 퍼센트와 줄높이 값이 다릅니다\./g, "The percent in the style name does not match the line-height value."],
  [/줄높이는 양수여야 합니다\./g, "Line height must be positive."],
  [/픽셀 줄높이를 나눌 글자 크기\/참조를 확인하세요\./g, "Check the font size or reference to divide a pixel line height by."],
  [/값 없음/g, "no value"],
  [/Figma 텍스트 스타일 "([^"]*)"/g, 'Figma text style "$1"'],
];

export function hasHangul(text) {
  return HANGUL.test(String(text ?? ""));
}

/**
 * 한국어 파이프라인 메시지 → 영어. 옮기지 못한 조각이 남으면 null —
 * 부르는 쪽은 원문을 쓰고(lang="ko"), 테스트가 빠진 규칙을 알린다.
 */
export function toEnglish(text) {
  const src = String(text ?? "");
  if (!hasHangul(src)) return src;
  let out = src;
  for (const [pattern, replacement] of RULES) out = out.replace(pattern, replacement);
  return hasHangul(out) ? null : out;
}

/** { ko, en } 쌍. en 이 없으면 ko 를 그대로 둔다(문서가 lang="ko" 로 표시). */
export function bilingual(text) {
  const ko = String(text ?? "");
  const en = toEnglish(ko);
  return en === null ? { ko, en: ko, missing: true } : { ko, en };
}
