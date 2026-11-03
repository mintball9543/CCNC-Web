import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { cn } from "@/lib/utils/cn";
import type { BoardCategory } from "@/types";

/** 게시판 상단: 전체 건수 · 카테고리 탭 · 검색 (GET form — JS 없이 동작) */
export function BoardToolbar({
  basePath,
  total,
  page,
  totalPages,
  categories,
  category,
  keyword,
}: {
  basePath: string;
  total: number;
  page: number;
  totalPages: number;
  categories?: BoardCategory[];
  category?: string | null;
  keyword?: string | null;
}) {
  return (
    <div className="mb-4 space-y-4">
      {categories && (
        <ul className="flex flex-wrap gap-2" aria-label="분류">
          {[{ key: "", label: "전체" }, ...categories].map((c) => {
            const active = (category ?? "") === c.key;
            return (
              <li key={c.key}>
                <Link
                  href={c.key ? `${basePath}?category=${c.key}` : basePath}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-block rounded-full border px-4 py-1.5 text-sm transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {c.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          전체 <strong className="text-foreground">{total.toLocaleString()}</strong>건 ({page}/
          {totalPages} 페이지)
        </p>
        <form action={basePath} method="get" role="search" className="flex gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          <label htmlFor="board-search" className="sr-only">
            검색어
          </label>
          <Input
            id="board-search"
            name="q"
            defaultValue={keyword ?? ""}
            placeholder="제목 또는 내용 검색"
            className="sm:w-64"
          />
          <Button type="submit" variant="secondary" aria-label="검색">
            <Search className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
