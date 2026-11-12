import { ExternalLink } from "lucide-react";

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
