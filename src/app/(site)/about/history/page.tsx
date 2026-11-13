import { CENTER_HISTORY, REGIONAL_CENTER } from "@/lib/content/center-plan";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/about/history");

/** 설립근거·연혁 (src/lib/content/center-plan.ts) */
export default function Page() {
  return (
    <div className="space-y-12">
      <section aria-labelledby="basis-heading">
        <h2 id="basis-heading" className="mb-4 text-[1.375rem] font-bold">
          설립근거
        </h2>
        <div className="space-y-4 leading-relaxed">
          <p className="rounded-2xl bg-primary-soft px-6 py-5">{REGIONAL_CENTER.basis}</p>
          <p>{REGIONAL_CENTER.nationwide}</p>
          <p>{REGIONAL_CENTER.role}</p>
        </div>
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-5 text-[1.375rem] font-bold">
          주요 연혁
        </h2>
        <ol className="relative space-y-6 border-l-2 border-primary/30 pl-6">
          {CENTER_HISTORY.map((h, i) => (
            <li key={i} className="relative">
              <span
                className="absolute top-1.5 -left-[1.95rem] size-3.5 rounded-full border-2 border-background bg-primary"
                aria-hidden
              />
              <p className="font-mono font-semibold text-primary">{h.date}</p>
              <p className="mt-0.5">{h.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
