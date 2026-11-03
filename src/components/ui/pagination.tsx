import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** 페이지 번호 → URL */
  hrefFor: (page: number) => string;
}

export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;
  const windowSize = 5;
  const start = Math.max(
    1,
    Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize + 1),
  );
  const pages = Array.from({ length: Math.min(windowSize, totalPages) }, (_, i) => start + i);
  const item = "inline-flex size-9 items-center justify-center rounded-lg text-sm transition";

  return (
    <nav aria-label="페이지 이동" className="mt-8 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className={cn(item, "hover:bg-muted")}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(item, "opacity-30")} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            item,
            p === page ? "bg-primary font-semibold text-primary-foreground" : "hover:bg-muted",
          )}
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          className={cn(item, "hover:bg-muted")}
          aria-label="다음 페이지"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(item, "opacity-30")} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
