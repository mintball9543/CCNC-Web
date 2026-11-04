import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/feedback";
import { formatDate } from "@/lib/utils/format";
import type { PostSummary } from "@/types";

/** 사진 카드형 게시판 (센터소식 — 행사·활동 사진) */
export function PostGallery({
  posts,
  hrefFor,
  emptyText = "등록된 게시글이 없습니다.",
}: {
  posts: PostSummary[];
  hrefFor: (post: PostSummary) => string;
  emptyText?: string;
}) {
  if (posts.length === 0) return <EmptyState title={emptyText} />;
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={hrefFor(post)}
            className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              {post.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="size-8" aria-hidden />
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="line-clamp-2 font-semibold group-hover:text-primary">{post.title}</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatDate(post.publishedAt)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
