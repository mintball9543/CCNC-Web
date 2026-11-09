import { Container } from "@/components/ui/container";
import type { StatHighlight } from "@/types";

/** 숫자로 보는 센터 — 관리자 > 숫자로 보는 센터에서 수정 */
export function StatHighlights({ stats }: { stats: StatHighlight[] }) {
  if (stats.length === 0) return null;
  return (
    <section
      aria-labelledby="stats-heading"
      className="bg-ci-navy text-white dark:bg-card dark:text-foreground"
    >
      <Container className="py-14">
        <h2 id="stats-heading" className="text-2xl font-bold">
          함께 만든 변화, 우리의 발자국🌱
        </h2>
        <dl className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="border-l-2 border-ci-lime pl-4">
              <dt className="text-sm text-white/75 dark:text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1">
                <span className="text-4xl font-bold lg:text-5xl">
                  {stat.value.toLocaleString("ko-KR")}
                </span>
                {stat.unit && <span className="ml-1 text-lg font-semibold">{stat.unit}</span>}
                {stat.description && (
                  <span className="mt-1 block text-xs text-white/60 dark:text-muted-foreground">
                    {stat.description}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
