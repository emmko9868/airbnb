<!-- @ds-generated db779a9dc7bcdaeb — `pnpm ds:gen` 이 만든 파일입니다.
   ds.config.json + 실제 토큰에서 생성
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. -->
# 디자인 토큰 (MUST)

> 현재 해석: L2a — primitive 까지 선언, semantic 을 추론
>
> 이 파일은 `ds.config.json` 과 실제 토큰에서 생성됩니다. 손으로 쓴 규칙은 토큰 이름이 바뀌는 순간 거짓말이 되기 때문입니다.

## 계층

`Hexcode → Primitive → Semantic`. 컴포넌트는 **semantic 과 layout 만** 참조한다.

| 계층 | 쓰는 곳 | 예 |
|---|---|---|
| primitive | 쓰지 않는다 | `--color-blue-500: #0066FF` |
| semantic | **여기만 쓴다** | `--color-primary: var(--color-blue-500)` |
| layout | 간격·모서리·타이포·모션 | `--radius-md`, `--spacing` |

## 금지

- 색상·간격·모서리·폰트를 리터럴로 쓰지 않는다. `#fff`, `16px`, `8px` 전부 금지.
- primitive 를 컴포넌트에서 직접 참조하지 않는다 (`var(--color-blue-500)` ✗).
- 없는 토큰을 만들어 쓰지 않는다. 필요하면 Figma 에 추가하고 다시 읽는다.

## 쓸 수 있는 semantic 토큰 (이게 전부다)

```css
--color-bg   /* gray-50 */
--color-surface   /* gray-50 */
--color-text   /* gray-900 */
--color-text-secondary   /* gray-500 */
--color-text-disabled   /* gray-400 */
--color-border   /* gray-300 */
--color-border-strong   /* gray-400 */
--color-surface-raised   /* gray-50 */
--color-primary   /* blue-500 */
--color-primary-hover   /* blue-600 */
--color-primary-active   /* blue-700 */
--color-on-primary   /* gray-50 */
--color-danger   /* red-500 */
--color-warning   /* amber-500 */
--color-success   /* green-500 */
--color-info   /* blue-500 */
```

## layout 토큰

```css
--radius-md: 8px;
--radius-lg: 12px;
--spacing: 4px;
--border-width-thin: 1px;
--color-overlay: rgb(0 0 0 / 45%);
--radius-sm: 4px;
--radius-full: 9999px;
--border-width-thick: 2px;
--shadow-sm: 0 1px 2px rgba(0,0,0,.06);
--shadow-md: 0 4px 12px rgba(0,0,0,.08);
--shadow-lg: 0 12px 32px rgba(0,0,0,.12);
--duration-fast: 150ms;
--duration-normal: 250ms;
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
--text-body-2: 14px;
--text-body-1: 16px;
--text-title: 20px;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-bold: 700;
--leading-tight: 1.25;
--leading-normal: 1.5;
```

## 주의 — 추론된 토큰

아래 35개는 사람이 선언한 값이 아니라 추론·합성된 것이다. 쓰기 전에 사용자에게 확인할 것.

- `--color-bg` — inferred / 무채색 계열 중 가장 밝음
- `--color-surface` — inferred / bg 와 동일 (분리된 표면 단계가 없음)
- `--color-text` — inferred / 무채색 계열 중 가장 어두움
- `--color-text-secondary` — inferred / 명도 0.45 근처
- `--color-text-disabled` — inferred / 명도 0.65 근처
- `--color-border` — inferred / 명도 0.85 근처
- `--color-border-strong` — inferred / 명도 0.72 근처
- `--color-surface-raised` — inferred / bg 보다 밝은 무채색이 없어 bg 와 동일
- `--color-primary` — inferred / 이름 단서 없음 — 채도 높고 중간 밝기인 색
- `--color-primary-hover` — inferred / primary 램프의 한 단계 어두운 스텝
- `--color-primary-active` — inferred / primary 램프의 두 단계 어두운 스텝
- `--color-on-primary` — inferred / primary 대비 4.6:1 로 최대
- `--color-danger` — inferred / hue 340~20° 계열의 기준 스텝
- `--color-warning` — inferred / hue 30~65° 계열의 기준 스텝
- `--color-success` — inferred / hue 90~160° 계열의 기준 스텝
- `--color-info` — inferred / hue 190~255° 에 전용 계열이 없어 primary 계열 재사용
- `--color-overlay` — synthesized / 기본 layout 세트에서 보충함
- `--radius-sm` — synthesized / 기본 layout 세트에서 보충함
- `--radius-full` — synthesized / 기본 layout 세트에서 보충함
- `--border-width-thick` — synthesized / 기본 layout 세트에서 보충함
- … 외 15개
