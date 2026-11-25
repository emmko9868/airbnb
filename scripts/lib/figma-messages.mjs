/**
 * Figma 읽기 상태에 따라 AI 가 학생에게 그대로 하는 말(Q-69 E).
 * figma-jobs(프롬프트 훅)와 component-plan(승인·구현 검사)이 함께 쓴다. 서로를 import 하면 순환이 되므로 따로 둔다.
 */
export const FIGMA_NO_ANSWER_STUDENT = "Figma did not answer. Make sure the Figma desktop app is open with this file, then send the same message again.";
export const FIGMA_STILL_READING_STUDENT = "Still reading the Figma design. Send the same request again in 1–2 minutes.";
/** 이 문장이 든 검사 결과는 "고쳐라"가 아니라 "학생에게 말하고 멈춰라"다. */
export const isFigmaStop = (text) => [FIGMA_NO_ANSWER_STUDENT, FIGMA_STILL_READING_STUDENT].some((sentence) => String(text ?? "").includes(sentence));

/** 같은 대화에서 다른 부품으로 넘어갈 때 AI 가 학생에게 하는 말(Q-70 결정 6). <Part> 자리에 이 대화가 다룬 부품 이름. */
export const newChatSentence = (part) => `Please start a new chat (+) for this part. This chat already worked on ${part}, so every step here would cost much more.`;
export const NEW_CHAT_MARK = "Please start a new chat (+) for this part";
/**
 * 키트가 시킨 올바른 멈춤 문장(Q-70 결정 9). AI 의 마지막 말에 이 중 하나가 있으면 Stop 훅이 "계속 고쳐라"로 되돌리지 않는다.
 * 강사 문장(반복 실패 멈춤), Figma 응답 없음·읽는 중, 키트 검사 꺼짐, 새 대화 안내.
 */
export const KIT_STOP_SENTENCES = [
  "Please show this screen to the instructor",
  "Figma did not answer",
  "Still reading the Figma design",
  "The kit's checks are off",
  NEW_CHAT_MARK,
];
export const isKitStop = (text) => KIT_STOP_SENTENCES.some((sentence) => String(text ?? "").includes(sentence));
