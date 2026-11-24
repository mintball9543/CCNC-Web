import { InfoTable } from "@/components/content/info-table";
import { Tabs } from "@/components/ui/tabs";
import {
  SECTOR_INDICATOR_HEAD,
  SECTOR_SOURCE,
  SECTOR_TARGETS,
  sectorTaskSummary,
  type SectorTarget,
} from "@/lib/content/carbon-info";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/carbon-neutral/sector-targets");

function DirectionList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <p className="mb-2 font-bold text-primary">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="relative pl-4 leading-relaxed">
            <span
              className="absolute top-[0.7em] left-0 size-1.5 rounded-full bg-primary/60"
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectorPanel({ sector }: { sector: SectorTarget }) {
  return (
    <div className="space-y-10">
      <div className="rounded-2xl bg-ci-navy px-6 py-7 text-white">
        <p className="text-sm opacity-80">{sector.label} 부문</p>
        <p className="mt-1 text-xl font-bold sm:text-2xl">{sector.slogan}</p>
      </div>

      <section aria-labelledby={`${sector.key}-direction`}>
        <h3 id={`${sector.key}-direction`} className="mb-3 text-lg font-bold">
          추진방향
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <DirectionList title="단기" items={sector.shortTerm} />
          <DirectionList title="중·장기" items={sector.longTerm} />
        </div>
      </section>

      <section aria-labelledby={`${sector.key}-indicators`}>
        <h3 id={`${sector.key}-indicators`} className="mb-3 text-lg font-bold">
          주요지표(안)
        </h3>
        <InfoTable
          table={{
            caption: `${sector.label} 부문 주요지표(안)`,
            head: SECTOR_INDICATOR_HEAD,
            rows: sector.indicators,
            minWidth: "min-w-[760px]",
          }}
        />
      </section>

      <section aria-labelledby={`${sector.key}-tasks`}>
        <h3 id={`${sector.key}-tasks`} className="mb-3 text-lg font-bold">
          과제 및 세부사업{" "}
          <span className="ml-1 text-base font-medium text-primary">
            {sectorTaskSummary(sector)}
          </span>
        </h3>
        <ol className="space-y-4">
          {sector.tasks.map((task, i) => (
            <li key={task.title} className="rounded-2xl border border-border p-5">
              <p className="flex items-baseline gap-2 font-bold">
                <span className="font-mono text-sm text-primary">과제 {i + 1}</span>
                {task.title}
              </p>
              <ul className="mt-3 grid gap-x-6 gap-y-1.5 border-t border-border pt-3 sm:grid-cols-2">
                {task.projects.map((p) => (
                  <li key={p} className="relative pl-4 text-sm leading-relaxed">
                    <span
                      className="absolute top-[0.65em] left-0 size-1.5 rounded-full bg-primary/60"
                      aria-hidden
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
      <p className="text-xs text-muted-foreground">자료: {SECTOR_SOURCE}</p>
    </div>
  );
}

/** 부문별 감축목표 — 기존 8개 페이지를 한 페이지 탭으로 통합 */
export default function Page() {
  return (
    <Tabs
      label="부문 선택"
      tabs={SECTOR_TARGETS.map((sector) => ({
        id: sector.key,
        label: sector.label,
        content: <SectorPanel sector={sector} />,
      }))}
    />
  );
}
