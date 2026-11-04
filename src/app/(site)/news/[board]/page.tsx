import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BoardSkeleton } from "@/components/board/board-skeleton";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { PostGallery } from "@/components/board/post-gallery";
import { PostTable } from "@/components/board/post-table";
import { Pagination } from "@/components/ui/pagination";
import { boardList, getBoard } from "@/lib/config/boards";
import { getPublishedPosts } from "@/lib/queries/posts";

export function generateStaticParams() {
  return boardList.map((board) => ({ board: board.key }));
}

export async function generateMetadata({ params }: PageProps<"/news/[board]">): Promise<Metadata> {
  const board = getBoard((await params).board);
  return board ? { title: board.title, description: board.description } : {};
}

export default function BoardPage(props: PageProps<"/news/[board]">) {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <BoardList {...props} />
    </Suspense>
  );
}

async function BoardList({ params, searchParams }: PageProps<"/news/[board]">) {
  const board = getBoard((await params).board);
  if (!board) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const category =
    typeof sp.category === "string" && board.categories?.some((c) => c.key === sp.category)
      ? sp.category
      : null;
  const keyword = typeof sp.q === "string" ? sp.q.slice(0, 50) : null;

  const result = await getPublishedPosts(board.key, { page, category, keyword });
  const basePath = `/news/${board.key}`;
  const query = (p: number) => {
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    if (keyword) qs.set("q", keyword);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <>
      <BoardToolbar
        basePath={basePath}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        categories={board.categories}
        category={category}
        keyword={keyword}
      />
      {board.layout === "gallery" ? (
        <PostGallery
          posts={result.items}
          hrefFor={(post) => `${basePath}/${post.id}`}
          emptyText={keyword ? "검색 결과가 없습니다." : undefined}
        />
      ) : (
        <PostTable
          boardKey={board.key}
          posts={result.items}
          startNumber={result.total - (result.page - 1) * result.pageSize}
          hrefFor={(post) => `${basePath}/${post.id}`}
          emptyText={keyword ? "검색 결과가 없습니다." : undefined}
        />
      )}
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={query} />
    </>
  );
}
