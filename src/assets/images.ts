/**
 * my-assets/images 의 그림(png·jpg·jpeg·webp·gif·avif·svg) 목록. Storybook 의 Foundation → Images 가 보여 주고,
 * 웹사이트 페이지도 같은 이름으로 주소를 받는다:
 *
 *   import { imageUrl } from "@/assets/images";
 *   imageUrl("hero-photo")  // my-assets/images/hero-photo.png 의 주소 (없으면 undefined)
 *
 * 이름은 `pnpm assets` 가 정리한 파일 이름에서 확장자를 뗀 것(소문자·대시)이다.
 * SVG 그림도 주소(<img src>)로만 쓰므로 안의 코드가 실행되지 않는다. `pnpm assets` 가 위험한 SVG 를 먼저 막는다.
 */

export interface UserImage {
  /** 확장자를 뗀 파일 이름. 예: "hero-photo" */
  name: string;
  /** 프로젝트 안의 경로. 예: "my-assets/images/hero-photo.png" */
  file: string;
  /** 브라우저에서 쓰는 주소 */
  url: string;
  /** 소문자 확장자. 예: "png" */
  ext: string;
}

const urls = import.meta.glob("../../my-assets/images/*.{png,jpg,jpeg,webp,gif,avif,svg,PNG,JPG,JPEG,WEBP,GIF,AVIF,SVG}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** 이름으로 쓸 수 있는 파일만(소문자·숫자·대시). 정리 전 파일은 `pnpm assets` 를 돌리면 보인다. */
const SAFE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const userImages: UserImage[] = Object.entries(urls)
  .map(([path, url]) => {
    const file = path.split("/").pop() ?? "";
    const dot = file.lastIndexOf(".");
    return { name: file.slice(0, dot), file: `my-assets/images/${file}`, url, ext: file.slice(dot + 1).toLowerCase() };
  })
  .filter((image) => SAFE_NAME.test(image.name))
  .sort((a, b) => a.name.localeCompare(b.name) || a.ext.localeCompare(b.ext));

/** 이름 → 주소. 같은 이름이 여러 형식으로 있으면 이름 순으로 첫 파일(avif → gif → jpeg → jpg → png → svg → webp). */
export const images: Readonly<Record<string, string>> = Object.freeze(
  userImages.reduce<Record<string, string>>((all, image) => {
    if (!(image.name in all)) all[image.name] = image.url;
    return all;
  }, {}),
);

/** my-assets/images 의 그림 주소. 없는 이름이면 undefined — 지어낸 그림으로 대신하지 않는다. */
export function imageUrl(name: string): string | undefined {
  return Object.hasOwn(images, name) ? images[name] : undefined;
}
