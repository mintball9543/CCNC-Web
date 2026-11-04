"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MAX_SERIES } from "@/lib/charts/limits";
import { formatTick, formatValue, niceTicks } from "@/lib/charts/scale";
import { cn } from "@/lib/utils/cn";
import type { ChartDataset } from "@/types";

type ChartData = Pick<
  ChartDataset,
  "title" | "unit" | "chartType" | "categoryLabel" | "series" | "rows"
>;

const HEIGHT = 300;
const PAD = { top: 24, right: 16, bottom: 36, left: 56 };
const BAR_MAX = 24;
const GAP = 2;
const seriesColor = (i: number) => `var(--series-${(i % MAX_SERIES) + 1})`;

/**
 * 관리자 입력 데이터로 그리는 도표 (막대 / 누적 막대 / 선).
 * - 범례(계열 2개 이상), 항목별 툴팁(마우스·키보드), 표 보기를 항상 함께 제공한다.
 * - 색상은 globals.css 의 --series-N (색각이상 검증 완료, 라이트/다크 각각 지정)
 */
export function DataChart({ data, className }: { data: ChartData; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const tableId = useId();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(280, Math.round(entry.contentRect.width))),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { rows, series, chartType } = data;
  if (rows.length === 0 || series.length === 0) return null;

  const values = rows.flatMap((r) =>
    chartType === "stacked"
      ? [r.values.reduce<number>((sum, v) => sum + (v ?? 0), 0)]
      : r.values.map((v) => v ?? 0),
  );
  const ticks = niceTicks(Math.min(...values), Math.max(...values));
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const y = (v: number) => PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const band = plotW / rows.length;
  const cx = (i: number) => PAD.left + band * i + band / 2;

  const groupCount = chartType === "bar" ? series.length : 1;
  const barW = Math.max(4, Math.min(BAR_MAX, (band * 0.7 - GAP * (groupCount - 1)) / groupCount));
  const showLegend = series.length > 1;
  const labelEvery = Math.ceil(rows.length / Math.max(1, Math.floor(plotW / 56)));

  /** 위쪽만 4px 둥근 막대 경로 (음수면 아래쪽) */
  const barPath = (x: number, v0: number, v1: number, w: number, roundTop: boolean) => {
    const top = Math.min(y(v0), y(v1));
    const bottom = Math.max(y(v0), y(v1));
    const h = bottom - top;
    if (h <= 0) return "";
    const r = roundTop ? Math.min(4, h, w / 2) : 0;
    const up = v1 >= v0;
    return up
      ? `M${x},${bottom}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${bottom}Z`
      : `M${x},${top}V${bottom - r}Q${x},${bottom} ${x + r},${bottom}H${x + w - r}Q${x + w},${bottom} ${x + w},${bottom - r}V${top}Z`;
  };

  const tooltipRow = active !== null ? rows[active] : null;

  return (
    <figure className={cn("space-y-3", className)}>
      {showLegend && (
        <ul
          className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"
          aria-label="범례"
        >
          {series.map((name, i) => (
            <li key={name + i} className="flex items-center gap-1.5">
              {chartType === "line" ? (
                <span
                  className="h-0.5 w-4 rounded"
                  style={{ background: seriesColor(i) }}
                  aria-hidden
                />
              ) : (
                <span
                  className="size-3 rounded-sm"
                  style={{ background: seriesColor(i) }}
                  aria-hidden
                />
              )}
              {name}
            </li>
          ))}
        </ul>
      )}

      <div ref={containerRef} className="relative">
        <svg
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={`${data.title} ${chartType === "line" ? "선" : "막대"} 도표. 정확한 수치는 표 보기를 참고하세요.`}
          aria-describedby={tableId}
          onPointerLeave={() => setActive(null)}
        >
          {/* 눈금선 */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="fill-muted-foreground text-[11px] tabular-nums"
              >
                {formatTick(t, yMax)}
              </text>
            </g>
          ))}
          {data.unit && (
            <text x={0} y={11} textAnchor="start" className="fill-muted-foreground text-[11px]">
              단위: {data.unit}
            </text>
          )}

          {/* 가로축 항목 */}
          {rows.map((row, i) =>
            i % labelEvery === 0 ? (
              <text
                key={row.label + i}
                x={cx(i)}
                y={HEIGHT - 12}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {row.label}
              </text>
            ) : null,
          )}

          {/* 막대 */}
          {chartType === "bar" &&
            rows.map((row, i) => {
              const groupW = barW * series.length + GAP * (series.length - 1);
              return row.values.map((v, s) =>
                v === null ? null : (
                  <path
                    key={`${i}-${s}`}
                    d={barPath(cx(i) - groupW / 2 + s * (barW + GAP), 0, v, barW, true)}
                    fill={seriesColor(s)}
                    opacity={active === null || active === i ? 1 : 0.55}
                  />
                ),
              );
            })}

          {/* 누적 막대 — 구간 사이 2px 간격 */}
          {chartType === "stacked" &&
            rows.map((row, i) => {
              let acc = 0;
              const lastIndex = row.values.reduce<number>(
                (last, v, s) => ((v ?? 0) > 0 ? s : last),
                -1,
              );
              return row.values.map((v, s) => {
                if (!v || v <= 0) return null;
                const from = acc;
                acc += v;
                const isTop = s === lastIndex;
                const x = cx(i) - barW / 2;
                // 맨 위 구간만 둥근 끝, 나머지는 위쪽에 2px 바탕색 간격
                const d = isTop
                  ? barPath(x, from, acc, barW, true)
                  : y(from) - (y(acc) + GAP) > 0
                    ? `M${x},${y(from)}V${y(acc) + GAP}H${x + barW}V${y(from)}Z`
                    : "";
                if (!d) return null;
                return (
                  <path
                    key={`${i}-${s}`}
                    d={d}
                    fill={seriesColor(s)}
                    opacity={active === null || active === i ? 1 : 0.55}
                  />
                );
              });
            })}

          {/* 선 + 표시점(2px 바탕색 테두리) */}
          {chartType === "line" &&
            series.map((name, s) => {
              const points = rows
                .map((row, i) =>
                  row.values[s] === null ? null : ([cx(i), y(row.values[s] as number)] as const),
                )
                .filter((p): p is readonly [number, number] => p !== null);
              return (
                <g key={name + s}>
                  <polyline
                    points={points.map((p) => p.join(",")).join(" ")}
                    fill="none"
                    stroke={seriesColor(s)}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {points.map(([px, py], k) => (
                    <circle
                      key={k}
                      cx={px}
                      cy={py}
                      r={4}
                      fill={seriesColor(s)}
                      stroke="var(--card)"
                      strokeWidth={2}
                    />
                  ))}
                </g>
              );
            })}

          {/* 기준선 */}
          <line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={y(0)}
            y2={y(0)}
            stroke="var(--muted-foreground)"
            strokeWidth={1}
            opacity={0.6}
          />

          {/* 십자선 */}
          {active !== null && chartType === "line" && (
            <line
              x1={cx(active)}
              x2={cx(active)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
            />
          )}

          {/* 항목별 마우스·키보드 영역 (표시보다 넓게) */}
          {rows.map((row, i) => (
            <rect
              key={`hit-${i}`}
              x={PAD.left + band * i}
              y={PAD.top}
              width={band}
              height={plotH}
              fill="transparent"
              tabIndex={0}
              role="button"
              aria-label={`${row.label}: ${series.map((n, s) => `${n} ${formatValue(row.values[s], data.unit)}`).join(", ")}`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="cursor-crosshair focus:outline-none"
            />
          ))}
        </svg>

        {tooltipRow && active !== null && (
          <div
            className="pointer-events-none absolute z-10 min-w-36 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"
            style={{
              left: Math.min(cx(active) + 12, width - 170),
              top: PAD.top,
            }}
            role="status"
          >
            <p className="mb-1 text-muted-foreground">
              {data.categoryLabel} {tooltipRow.label}
            </p>
            <ul className="space-y-0.5">
              {series.map((name, s) => (
                <li key={name + s} className="flex items-center gap-2">
                  <span
                    className="h-0.5 w-3 rounded"
                    style={{ background: seriesColor(s) }}
                    aria-hidden
                  />
                  <strong className="tabular-nums">
                    {formatValue(tooltipRow.values[s], data.unit)}
                  </strong>
                  <span className="text-muted-foreground">{name}</span>
                </li>
              ))}
              {chartType === "stacked" && (
                <li className="mt-1 border-t border-border pt-1">
                  <strong className="tabular-nums">
                    {formatValue(
                      tooltipRow.values.reduce<number>((sum, v) => sum + (v ?? 0), 0),
                      data.unit,
                    )}
                  </strong>{" "}
                  <span className="text-muted-foreground">합계</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <details className="rounded-lg border border-border text-sm">
        <summary className="cursor-pointer px-3 py-2 font-medium">표로 보기</summary>
        <div className="overflow-x-auto px-3 pb-3">
          <table id={tableId} className="w-full text-center">
            <caption className="sr-only">
              {data.title} {data.unit && `(단위: ${data.unit})`}
            </caption>
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th scope="col" className="py-2 font-medium">
                  {data.categoryLabel}
                </th>
                {series.map((name, s) => (
                  <th key={name + s} scope="col" className="py-2 font-medium">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label + i} className="border-b border-border last:border-0">
                  <th scope="row" className="py-1.5 font-normal">
                    {row.label}
                  </th>
                  {series.map((name, s) => (
                    <td key={name + s} className="py-1.5 tabular-nums">
                      {formatValue(row.values[s])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
