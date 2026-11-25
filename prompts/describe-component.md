# 컴포넌트 설명 생성 프롬프트

`scripts/lib/ai.mjs` 가 쓰는 프롬프트의 원본. 모델을 바꾸거나 톤을 조정할 때 여기를 고치고 `ai.mjs` 의 `SYSTEM` 에 반영한다.

## 원칙

1. **Figma 에 설명이 있으면 LLM 을 호출하지 않는다.** 사람이 쓴 것이 언제나 우선이다.
2. 사람이 `descriptions.json` 에 `source: "human"` 으로 쓴 것은 **절대 덮어쓰지 않는다.**
3. 추측 결과는 `source: "ai-inferred"` 로 남고 검토 대상이다. Figma 로 되돌려 쓰지 않는다.
4. variant 구조가 바뀌면(`specHash` 변경) 다시 생성한다. 이름만 같고 속살이 달라졌을 수 있다.

## 입력에 반드시 넣을 것

이름만 주면 일반론이 나온다. 품질을 올리는 실질적 입력은 이것들이다.

- 컴포넌트 이름 + Figma 페이지 이름
- variant 속성 이름과 값 (원본 표기 그대로 — "Primary" 를 "primary" 로 바꾸지 말 것)
- 상태 variant 목록
- variant 조합 수
- (여유가 있으면) 실제 인스턴스 사용처 — 어느 화면에서 몇 번 쓰이는지

## 출력 계약

```json
{ "description": "평문 한두 문장", "confidence": 0.0 }
```

flash 급 모델은 코드펜스와 앞뒤 잡소리를 자주 흘린다. `parseJsonLoose` 가 첫 JSON 객체만 꺼내도록 방어하고 있으니 프롬프트에서 "JSON 만" 을 강하게 요구하되 파싱은 믿지 말 것.
