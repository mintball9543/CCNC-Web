import { ExternalLink } from "lucide-react";
import type { RelatedSite } from "@/types";

/**
 * 관련 기관 사이트 — 메인 화면 하단의 로고 카드 격자.
 * 로고는 관리자 > 관련 사이트에서 교체할 수 있고, 로고가 없으면 기관명을 글자로 표시한다.
 */
export function RelatedSites({ sites }: { sites: RelatedSite[] }) {
  if (sites.length === 0) return null;
  return (
    <section aria-labelledby="related-sites-heading">
      <h2 id="related-sites-heading" className="mb-6 text-2xl font-bold">
        관련 사이트
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {sites.map((site) => (
          <li key={site.id}>
            <RelatedSiteCard name={site.name} url={site.url} logoUrl={site.logoUrl} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 관련 사이트 카드 1개 — 메인 화면과 관리자 미리보기에서 함께 사용 */
export function RelatedSiteCard({
  name,
  url,
  logoUrl,
}: {
  name: string;
  url: string;
  logoUrl: string | null;
}) {
  return (
    <a
      href={url || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col gap-2.5 rounded-lg border border-border bg-card p-3 transition hover:border-primary hover:shadow-md"
    >
      <span className="flex aspect-[266/65] items-center justify-center overflow-hidden rounded bg-white px-2">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            loading="lazy"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-center text-sm font-bold text-ci-navy">{name}</span>
        )}
      </span>
      <span className="flex items-center justify-center gap-1 text-center text-sm text-muted-foreground group-hover:text-foreground">
        <span className="line-clamp-2">{name}</span>
        <ExternalLink className="size-3 shrink-0 opacity-60" aria-hidden />
        <span className="sr-only"> (새 창)</span>
      </span>
    </a>
  );
}
