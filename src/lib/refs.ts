import type { Ref } from "react";

/**
 * 여러 ref 에 같은 노드를 넣는다.
 *
 * forwardRef 로 받은 ref 와 컴포넌트 내부에서 쓰는 ref 가 같은 요소를 가리켜야 할 때 쓴다
 * (예: Checkbox 의 indeterminate 는 DOM 속성이라 내부 ref 가 필요하다).
 */
export function assignRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}
