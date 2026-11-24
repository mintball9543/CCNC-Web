import { GREETING } from "@/lib/content/greeting";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/about/greeting");

/** 센터장 인사말 (src/lib/content/greeting.ts) */
export default function Page() {
  return (
    <article aria-labelledby="greeting-heading" className="space-y-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {GREETING.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={GREETING.photo}
            alt={`${GREETING.signatureTitle} ${GREETING.directorName ?? ""}`.trim()}
            className="w-40 shrink-0 rounded-2xl object-cover md:w-56"
          />
        )}
        <div className="min-w-0 space-y-5">
          <h2
            id="greeting-heading"
            className="text-2xl leading-snug font-bold text-balance text-ci-navy sm:text-3xl dark:text-foreground"
          >
            {GREETING.headline}
          </h2>
          <div className="space-y-4 leading-relaxed">
            {GREETING.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      <ol className="grid gap-4 md:grid-cols-3">
        {GREETING.commitments.map((c, i) => (
          <li key={c.title} className="rounded-2xl border border-border p-6">
            <p className="font-mono text-sm font-semibold text-primary">0{i + 1}</p>
            <p className="mt-1 text-lg font-bold">{c.title}</p>
            <p className="mt-2 leading-relaxed text-muted-foreground">{c.text}</p>
          </li>
        ))}
      </ol>

      <div className="space-y-4 leading-relaxed">
        {GREETING.closing.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <p className="border-t border-border pt-6 text-right text-lg">
        {GREETING.signatureTitle}{" "}
        {GREETING.directorName ? (
          <strong className="ml-1 text-xl tracking-widest">{GREETING.directorName}</strong>
        ) : (
          <mark className="rounded bg-amber-100 px-1 text-base text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
            [확인 필요: 센터장 성명]
          </mark>
        )}
      </p>
    </article>
  );
}
