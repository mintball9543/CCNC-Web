export interface ScrollState {
  /** 현재 가로 스크롤 위치 */
  scrollLeft: number;
  /** 보이는 폭 */
  clientWidth: number;
  /** 전체 폭 */
  scrollWidth: number;
  /** 한 번에 넘길 거리 (카드 1장 + 간격) */
  step: number;
}

/** 끝에 닿았다고 볼 오차(px) — 브라우저 배율에 따라 소수점 오차가 생긴다 */
const EDGE = 2;

/** 가로로 넘겨볼 내용이 있는지 */
export function canScroll({
  clientWidth,
  scrollWidth,
}: Pick<ScrollState, "clientWidth" | "scrollWidth">) {
  return scrollWidth - clientWidth > EDGE;
}

/**
 * 한 칸 넘길 때의 다음 스크롤 위치.
 * 마지막에서 다음으로 가면 처음으로, 처음에서 이전으로 가면 마지막으로 돌아간다.
 */
export function nextScrollLeft(state: ScrollState, direction: 1 | -1): number {
  const max = Math.max(0, state.scrollWidth - state.clientWidth);
  if (max <= EDGE) return 0;
  if (direction === 1) {
    if (state.scrollLeft >= max - EDGE) return 0;
    return Math.min(max, state.scrollLeft + state.step);
  }
  if (state.scrollLeft <= EDGE) return max;
  return Math.max(0, state.scrollLeft - state.step);
}
