import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { MAX_KEYWORD_LENGTH } from "@/lib/search/terms";

/** 통합 검색 입력 (GET form — JS 없이 동작) */
export function SiteSearchForm({ keyword }: { keyword?: string | null }) {
  return (
    <form action="/search" method="get" role="search" className="flex gap-2">
      <label htmlFor="site-search" className="sr-only">
        통합 검색어
      </label>
      <Input
        id="site-search"
        type="search"
        name="q"
        defaultValue={keyword ?? ""}
        maxLength={MAX_KEYWORD_LENGTH}
        placeholder="검색어를 입력하세요 (예: 탄소중립 교육)"
        className="h-12 flex-1 text-base"
      />
      <Button type="submit" size="lg">
        <Search className="size-4" aria-hidden />
        검색
      </Button>
    </form>
  );
}
