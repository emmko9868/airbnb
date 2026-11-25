/**
 * my-assets/icons 의 SVG 원본 목록. Storybook 의 Foundation → Icons 가 보여 준다.
 * 부품은 이 목록을 직접 불러 쓰지 않는다 — AI 가 부품을 만들 때 해당 파일의 모양을 그대로 옮긴다.
 */

export interface UserIcon {
  name: string;
  file: string;
  svg: string;
}

const raw = import.meta.glob("../../my-assets/icons/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

/** 문서에 그릴 때 실행될 수 있는 부분(스크립트·이벤트·외부 링크)을 뺀다. `pnpm assets` 가 먼저 막는다. */
export function safeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:xlink:)?href\s*=\s*("\s*(?:https?:|javascript:)[^"]*"|'\s*(?:https?:|javascript:)[^']*')/gi, "");
}

export const userIcons: UserIcon[] = Object.entries(raw)
  .map(([path, svg]) => {
    const file = path.split("/").pop() ?? "";
    return { name: file.replace(/\.svg$/i, ""), file: `my-assets/icons/${file}`, svg: safeSvg(svg) };
  })
  .sort((a, b) => a.name.localeCompare(b.name));
