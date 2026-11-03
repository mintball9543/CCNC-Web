import { EmptyState } from "@/components/ui/feedback";
import type { EmissionDataset } from "@/types";

/**
 * 연도별 배출량 막대 차트 + 데이터 표.
 * 데이터는 src/lib/content/emissions.ts 에서 연도만 추가하면 자동 반영된다. (기존 연도별 이미지 8장 대체)
 * 차트는 시각 보조용이며, 동일 수치를 표로도 제공한다(웹 접근성).
 */
export function EmissionsChart({ dataset }: { dataset: EmissionDataset }) {
  const records = [...dataset.records].sort((a, b) => a.year - b.year);
  if (records.length === 0) {
    return <EmptyState title="공식 통계 반영 예정" description={`출처: ${dataset.source}`} />;
  }

  const max = Math.max(...records.map((r) => r.total));
  const chartHeight = 220;
  const barWidth = 36;
  const gap = 24;
  const width = records.length * (barWidth + gap) + gap;

  return (
    <figure className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-card p-4">
        <svg
          viewBox={`0 0 ${width} ${chartHeight + 48}`}
          className="h-72 min-w-full"
          role="img"
          aria-label={`${dataset.title} 막대 차트. 상세 수치는 아래 표 참고.`}
        >
          {records.map((record, i) => {
            const h = max === 0 ? 0 : (record.total / max) * chartHeight;
            const x = gap + i * (barWidth + gap);
            return (
              <g key={record.year}>
                <rect
                  x={x}
                  y={chartHeight - h + 16}
                  width={barWidth}
                  height={h}
                  rx={6}
                  className="fill-ci-ring"
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - h + 10}
                  textAnchor="middle"
                  className="fill-foreground text-[10px]"
                >
                  {record.total.toLocaleString()}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 36}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px]"
                >
                  {record.year}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <table className="w-full text-sm">
        <caption className="mb-2 text-left font-semibold">
          {dataset.title} (단위: {dataset.unit})
        </caption>
        <thead className="border-y border-border bg-muted/60">
          <tr>
            <th scope="col" className="py-2">
              연도
            </th>
            <th scope="col" className="py-2">
              총배출량
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.year} className="border-b border-border text-center">
              <th scope="row" className="py-2 font-normal">
                {r.year}
              </th>
              <td className="py-2">{r.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="text-xs text-muted-foreground">
        출처:{" "}
        {dataset.sourceUrl ? (
          <a
            href={dataset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {dataset.source}
          </a>
        ) : (
          dataset.source
        )}
        {dataset.publishedAt && ` (${dataset.publishedAt})`}
      </figcaption>
    </figure>
  );
}
