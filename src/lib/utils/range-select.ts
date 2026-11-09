/**
 * Shift 범위 선택 — 기준 위치와 누른 위치 사이(양 끝 포함)의 번호 목록.
 * 위→아래, 아래→위 어느 쪽으로 눌러도 같은 범위를 돌려준다.
 */
export function rangeBetween(anchor: number, index: number): number[] {
  const start = Math.min(anchor, index);
  const end = Math.max(anchor, index);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
