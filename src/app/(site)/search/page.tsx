import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Highlight } from "@/components/search/highlight";
import { SiteSearchForm } from "@/components/search/site-search-form";
import { BoardSkeleton } from "@/components/board/board-skeleton";
import { Container } from "@/components/ui/container";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
import { boards, getBoard, getCategoryLabel } from "@/lib/config/boards";
import { searchPosts } from "@/lib/queries/posts";
import { getVisibleNavigation } from "@/lib/queries/site";
import { searchMenus, visibleBoardKeys } from "@/lib/search/scope";
import { normalizeKeyword, splitSearchTerms } from "@/lib/search/terms";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import type { BoardKey } from "@/types";

export const metadata: Metadata = {
  title: "통합 검색",
  description: "메뉴와 알림마당 게시글을 한 번에 검색합니다.",
  // 검색 결과 화면은 검색엔진에 올리지 않는다
  robots: { index: false, follow: true },
};

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <Container className="py-12">
      <h1 className="mb-6 text-3xl font-bold">통합 검색</h1>
      <Suspense
        fallback={
          <>
            <SiteSearchForm />
            <div className="mt-8">
              <BoardSkeleton />
            </div>
          </>
        }
      >
        <SearchResults {...props} />
      </Suspense>
    </Container>
  );
}

async function SearchResults({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const keyword = normalizeKeyword(sp.q);
  const terms = splitSearchTerms(keyword);
  const navigation = await getVisibleNavigation();
  const boardKeys = visibleBoardKeys(navigation);
  const requested = typeof sp.board === "string" ? getBoard(sp.board)?.key : undefined;
  const boardKey = requested && boardKeys.includes(requested) ? requested : null;
  const page = Math.max(1, Number(sp.page) || 1);

  if (!keyword) {
    return (
      <>
        <SiteSearchForm />
        <p className="mt-6 text-sm text-muted-foreground">
          메뉴 이름과 알림마당 게시글(제목·내용)을 찾습니다. 띄어쓰기로 여러 단어를 넣으면 모든
          단어가 들어 있는 결과만 보여 줍니다.
        </p>
      </>
    );
  }

  const [result, menus] = await Promise.all([
    searchPosts({ keyword, boardKeys, boardKey, page }),
    Promise.resolve(boardKey ? [] : searchMenus(navigation, terms)),
  ]);
  const allCount = boardKeys.reduce((sum, key) => sum + (result.counts[key] ?? 0), 0);

  const href = (params: { board?: BoardKey | null; page?: number }) => {
    const qs = new URLSearchParams({ q: keyword });
    if (params.board) qs.set("board", params.board);
    if (params.page && params.page > 1) qs.set("page", String(params.page));
    return `/search?${qs}`;
  };

  return (
    <>
      <SiteSearchForm keyword={keyword} />
      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        ‘<strong className="text-foreground">{keyword}</strong>’ 검색 결과: 메뉴{" "}
        <strong className="text-foreground">{menus.length}</strong>건 · 게시글{" "}
        <strong className="text-foreground">{allCount.toLocaleString()}</strong>건
      </p>

      {menus.length > 0 && (
        <section className="mt-8" aria-labelledby="search-menus">
          <h2 id="search-menus" className="mb-3 text-lg font-bold">
            메뉴
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => (
              <li key={menu.href}>
                <Link
                  href={menu.href}
                  className="block rounded-xl border border-border px-4 py-3 transition hover:border-primary hover:bg-muted"
                >
                  <span className="block text-xs text-muted-foreground">{menu.section}</span>
                  <span className="font-medium">
                    <Highlight text={menu.title} terms={terms} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10" aria-labelledby="search-posts">
        <h2 id="search-posts" className="mb-3 text-lg font-bold">
          게시글
        </h2>
        <ul className="mb-4 flex flex-wrap gap-2" aria-label="게시판">
          {[null, ...boardKeys].map((key) => {
            const active = boardKey === key;
            const count = key ? (result.counts[key] ?? 0) : allCount;
            return (
              <li key={key ?? "all"}>
                <Link
                  href={href({ board: key })}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-block rounded-full border px-4 py-1.5 text-sm transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {key ? boards[key].title : "전체"} ({count.toLocaleString()})
                </Link>
              </li>
            );
          })}
        </ul>

        {result.items.length === 0 ? (
          <EmptyState
            title="검색 결과가 없습니다."
            description="다른 검색어를 넣거나 단어 수를 줄여 보세요."
          />
        ) : (
          <ul className="divide-y divide-border border-t-2 border-foreground">
            {result.items.map((post) => {
              const category = getCategoryLabel(post.boardKey, post.category);
              return (
                <li key={post.id} className="py-5">
                  <Link href={`/news/${post.boardKey}/${post.id}`} className="group block">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="primary">{boards[post.boardKey].title}</Badge>
                      {category && <Badge>{category}</Badge>}
                      <span className="text-base font-semibold group-hover:text-primary group-hover:underline">
                        <Highlight text={post.title} terms={terms} />
                      </span>
                    </div>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        <Highlight text={post.excerpt} terms={terms} />
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(post.publishedAt)}
                      <span className="mx-1">·</span>
                      조회 {post.viewCount.toLocaleString()}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          hrefFor={(p) => href({ board: boardKey, page: p })}
        />
      </section>
    </>
  );
}
