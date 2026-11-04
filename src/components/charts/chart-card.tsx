import type { ChartDataset } from "@/types";
import { DataChart } from "./data-chart";

/** 제목·설명·출처를 포함한 도표 카드 */
export function ChartCard({
  dataset,
  headingLevel = 3,
}: {
  dataset: ChartDataset;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <Heading className="text-lg font-bold">{dataset.title}</Heading>
      {dataset.description && (
        <p className="mt-1 text-sm text-muted-foreground">{dataset.description}</p>
      )}
      <DataChart data={dataset} className="mt-4" />
      {dataset.source && (
        <p className="mt-3 text-xs text-muted-foreground">
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
        </p>
      )}
    </section>
  );
}
