import Link from "next/link";
import { Plus } from "lucide-react";
import { boards } from "@/lib/config/boards";
import { getLatestPosts } from "@/lib/queries/posts";
import { formatDate } from "@/lib/utils/format";
import type { BoardKey } from "@/types";

/** 메인 최신글 (캐시됨 — 게시글 변경 시 즉시 갱신) */
export async function LatestPosts({ boardKey }: { boardKey: BoardKey }) {
  const board = boards[boardKey];
  const posts = await getLatestPosts(boardKey, 5);

  return (
    <section
      aria-labelledby={`latest-${boardKey}`}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between">
        <h2 id={`latest-${boardKey}`} className="text-lg font-bold">
          {board.title}
        </h2>
        <Link
          href={`/news/${boardKey}`}
          className="inline-flex items-center gap-0.5 text-sm text-muted-foreground hover:text-primary"
        >
          더보기 <Plus className="size-4" aria-hidden />
          <span className="sr-only">{board.title}</span>
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">등록된 게시글이 없습니다.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/news/${boardKey}/${post.id}`}
                className="flex items-center justify-between gap-4 py-3 text-sm hover:text-primary"
              >
                <span className="line-clamp-1">{post.title}</span>
                <time
                  className="shrink-0 text-muted-foreground"
                  dateTime={new Date(post.publishedAt).toISOString()}
                >
                  {formatDate(post.publishedAt)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
