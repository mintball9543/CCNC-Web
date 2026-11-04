/** 도표 축 계산 (순수 함수) */

/** 보기 좋은 눈금 (0, 2,000, 4,000 …) */
export function niceTicks(min: number, max: number, count = 5): number[] {
  const lo = Math.min(0, min);
  const hi = Math.max(0, max);
  if (hi === lo) return [0, 1];
  const rawStep = (hi - lo) / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const step =
    (normalized <= 1
      ? 1
      : normalized <= 2
        ? 2
        : normalized <= 2.5
          ? 2.5
          : normalized <= 5
            ? 5
            : 10) * magnitude;
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
  return ticks;
}

/** 축 눈금 표기: 10,000 이상이면 1만 단위 축약 */
export function formatTick(value: number, axisMax: number): string {
  if (Math.abs(axisMax) >= 100_000) {
    return `${(value / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}만`;
  }
  return value.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
}

export function formatValue(value: number | null | undefined, unit = ""): string {
  if (value === null || value === undefined) return "-";
  return `${value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ""}`;
}

/** 엑셀에서 복사한 표(탭 구분) → 2차원 배열 */
export function parseClipboardTable(text: string): string[][] {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.split("\t").map((cell) => cell.trim()));
}

/** "1,234.5" → 1234.5, 빈 값/숫자 아님 → null */
export function parseNumber(text: string): number | null {
  const cleaned = text.replace(/[,\s]/g, "");
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
