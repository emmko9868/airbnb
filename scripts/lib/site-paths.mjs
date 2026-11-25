/**
 * 학생 웹사이트 페이지 폴더. hook·페이지 검사·웹 빌드(vite.config.ts)·배포가 모두 이 값을 쓴다.
 * vite.config.ts 가 web-project.mjs 를 거쳐 불러오므로 다른 모듈에 의존하지 않는다.
 */
export const PAGES_DIR = "my-website/pages";
export const pageEntry = (name) => `${PAGES_DIR}/${name}Page.tsx`;
