import { createContext, createElement, useContext, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

/**
 * 컴포넌트 안쪽 문구(닫기·검색어 지우기·이전 달 …)의 언어.
 *
 * 두 가지 경로로 정한다.
 *   1. `<DsLocaleProvider locale="en">` 로 감싼다 — 앱에서 쓰는 방법.
 *   2. 감싸지 않았으면 전역 값(setLocale)을 따른다 — Storybook 의 MDX 문서처럼
 *      React 트리 바깥에서 언어를 바꿔야 하는 곳을 위한 것이다.
 *
 * prop 으로 준 글자(label·placeholder …)가 언제나 먼저다. 여기 문구는 기본값일 뿐이다.
 */
export type Locale = "ko" | "en";
export const LOCALES: Locale[] = ["ko", "en"];

// 기본 언어는 영어다. "ko" 를 받을 때만 한국어로 바꾼다.
let current: Locale = "en";
const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return current;
}

export function setLocale(next: string | undefined) {
  const locale: Locale = next === "ko" ? "ko" : "en";
  if (locale === current) return;
  current = locale;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const LocaleContext = createContext<Locale | null>(null);

export function DsLocaleProvider({ locale, children }: { locale: Locale; children?: ReactNode }) {
  return createElement(LocaleContext.Provider, { value: locale }, children);
}

/** 지금 언어. Provider 가 있으면 그것, 없으면 전역 값. */
export function useLocale(): Locale {
  const fromContext = useContext(LocaleContext);
  const global = useSyncExternalStore(subscribe, getLocale, getLocale);
  return fromContext ?? global;
}

const ko = {
  close: "닫기",
  dismissNotification: "알림 닫기",
  open: "열기",
  help: "도움말",
  more: "더보기",
  // CodeSnippet
  copyCode: "코드 복사",
  copied: "복사했습니다",
  copyFailed: "복사하지 못했습니다. 직접 선택해 복사하세요.",
  collapse: "접기",
  showMoreLines: (n: number) => `${n}줄 더 보기`,
  // DatePicker
  openCalendar: "달력 열기",
  chooseDate: "날짜 선택",
  prevMonth: "이전 달",
  nextMonth: "다음 달",
  monthTitle: (year: number, month: number) => `${year}년 ${month}월`,
  weekdays: ["일", "월", "화", "수", "목", "금", "토"],
  weekdaysLong: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
  dayLabel: (year: number, month: number, day: number) => `${year}년 ${month}월 ${day}일`,
  // 선택 계열
  selectPlaceholder: "선택하세요",
  comboPlaceholder: "입력해 검색",
  noResults: "결과가 없습니다",
  resultCount: (n: number) => `${n}개 결과`,
  selectedCount: (n: number) => `${n}개 선택됨`,
  // 탐색·목록
  breadcrumb: "현재 위치",
  tabs: "탭",
  tree: "트리",
  list: "목록",
  pick: "선택",
  pickRow: (id: string) => `${id} 선택`,
  viewSwitch: "보기 전환",
  pagination: "페이지",
  prevPage: "이전 페이지",
  nextPage: "다음 페이지",
  pageN: (n: number) => `${n} 페이지`,
  progressSteps: "진행 단계",
  stepError: "오류",
  stepDone: "완료",
  stepCurrent: "진행 중",
  stepPending: "대기",
  // 입력
  increment: (step: number) => `${step} 늘리기`,
  decrement: (step: number) => `${step} 줄이기`,
  search: "검색",
  searchPlaceholder: "검색어 입력",
  clearSearch: "검색어 지우기",
  time: "시각",
  format24: "24시간",
  format12: "12시간",
  hour: "시",
  minute: "분",
  meridiem: "오전 오후",
  am: "오전",
  pm: "오후",
  // 파일
  chooseFile: "파일 선택",
  dropHint: "파일을 여기에 끌어다 놓거나",
  uploading: "올리는 중",
  done: "완료",
  failed: "실패",
  remove: (name: string) => `${name} 제거`,
  tag: "태그",
  fileSummary: (n: number, failed: number) => `파일 ${n}개, 실패 ${failed}개`,
  // 진행
  loading: "불러오는 중",
  processing: "처리하는 중",
  newWindow: "(새 창)",
};

export type Messages = typeof ko;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const en: Messages = {
  close: "Close",
  dismissNotification: "Dismiss notification",
  open: "Open",
  help: "Help",
  more: "More options",
  copyCode: "Copy code",
  copied: "Copied",
  copyFailed: "Couldn't copy. Select the text and copy it yourself.",
  collapse: "Show less",
  showMoreLines: (n) => `Show ${plural(n, "more line")}`,
  openCalendar: "Open calendar",
  chooseDate: "Choose a date",
  prevMonth: "Previous month",
  nextMonth: "Next month",
  monthTitle: (year, month) => `${MONTHS[month - 1]} ${year}`,
  weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  weekdaysLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  dayLabel: (year, month, day) => `${MONTHS[month - 1]} ${day}, ${year}`,
  selectPlaceholder: "Select an option",
  comboPlaceholder: "Type to search",
  noResults: "No results",
  resultCount: (n) => plural(n, "result"),
  selectedCount: (n) => `${n} selected`,
  breadcrumb: "Breadcrumb",
  tabs: "Tabs",
  tree: "Tree",
  list: "List",
  pick: "Select",
  pickRow: (id) => `Select ${id}`,
  viewSwitch: "Switch view",
  pagination: "Pagination",
  prevPage: "Previous page",
  nextPage: "Next page",
  pageN: (n) => `Page ${n}`,
  progressSteps: "Progress",
  stepError: "Error",
  stepDone: "Complete",
  stepCurrent: "In progress",
  stepPending: "Not started",
  increment: (step) => `Increase by ${step}`,
  decrement: (step) => `Decrease by ${step}`,
  search: "Search",
  searchPlaceholder: "Search",
  clearSearch: "Clear search",
  time: "Time",
  format24: "24-hour",
  format12: "12-hour",
  hour: "Hour",
  minute: "Minute",
  meridiem: "AM or PM",
  am: "AM",
  pm: "PM",
  chooseFile: "Choose file",
  dropHint: "Drag and drop files here or",
  uploading: "Uploading",
  done: "Done",
  failed: "Failed",
  remove: (name) => `Remove ${name}`,
  tag: "tag",
  fileSummary: (n, failed) => `${plural(n, "file")}, ${failed} failed`,
  loading: "Loading",
  processing: "Processing",
  newWindow: "(opens in a new window)",
};

export const MESSAGES: Record<Locale, Messages> = { ko, en };

/** 컴포넌트 기본 문구. prop 으로 준 글자가 없을 때만 쓴다. */
export function useText(): Messages {
  return MESSAGES[useLocale()];
}
