import Link from "next/link";
import { Paperclip, Pin, Plus } from "lucide-react";
import { boards } from "@/lib/config/boards";
import { getLatestPosts } from "@/lib/queries/posts";
import { datePartsKst } from "@/lib/utils/format";
import type { BoardKey } from "@/types";

/**
 * 메인 최신글 — 큰 날짜(일)와 연·월, 큰 제목, 본문 요약 한 줄.
 * 캐시됨 (게시글 변경 시 즉시 갱신)
 */
export async function LatestPosts({ boardKey, limit = 4 }: { boardKey: BoardKey; limit?: number }) {
  const board = boards[boardKey];
  const posts = await getLatestPosts(boardKey, limit);

  return (
    <section
      aria-labelledby={`latest-${boardKey}`}
      className="rounded-2xl border border-border bg-card p-6 lg:p-7"
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 id={`latest-${boardKey}`} className="text-xl font-bold lg:text-2xl">
          {board.title}
        </h2>
        <Link
          href={`/news/${boardKey}`}
          className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-primary"
          aria-label={`${board.title} 더보기`}
        >
          <Plus className="size-6" aria-hidden />
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">등록된 게시글이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border">
          {posts.map((post) => {
            const { year, month, day } = datePartsKst(post.publishedAt);
            return (
              <li key={post.id}>
                <Link
                  href={`/news/${boardKey}/${post.id}`}
                  className="group flex items-start gap-5 py-5"
                >
                  <time
                    dateTime={new Date(post.publishedAt).toISOString()}
                    className="flex w-16 shrink-0 flex-col items-center leading-none"
                  >
                    <span className="text-3xl font-bold text-primary tabular-nums">{day}</span>
                    <span className="mt-2 text-xs text-muted-foreground tabular-nums">
                      {year}.{month}
                    </span>
                  </time>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      {post.isPinned && (
                        <Pin className="size-4 shrink-0 text-primary" aria-label="상단 고정" />
                      )}
                      <span className="line-clamp-1 text-base font-semibold group-hover:text-primary group-hover:underline lg:text-lg">
                        {post.title}
                      </span>
                      {post.hasAttachment && (
                        <Paperclip
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-label="첨부파일 있음"
                        />
                      )}
                    </span>
                    {post.excerpt && (
                      <span className="mt-1.5 line-clamp-1 text-sm text-muted-foreground">
                        {post.excerpt}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
