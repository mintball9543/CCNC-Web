import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { formatDate } from "@/lib/utils/format";
import type { PostSummary } from "@/types";

/** 센터 활동 — 센터소식 게시판의 대표 사진 (행사·활동을 도민에게 알리는 영역) */
export function ActivityGallery({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;
  const [feature, ...rest] = posts;

  return (
    <section aria-labelledby="activity-heading">
      <Container className="py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="activity-heading" className="text-2xl font-bold">
              센터 활동
            </h2>
            <p className="mt-1 text-muted-foreground">
              충청남도 탄소중립지원센터의 행사와 활동을 소개합니다.
            </p>
          </div>
          <Link
            href="/news/center-news"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            전체 보기 <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-4 md:grid-rows-2">
          <li className="md:col-span-2 md:row-span-2">
            <PhotoCard post={feature} large />
          </li>
          {rest.slice(0, 4).map((post) => (
            <li key={post.id}>
              <PhotoCard post={post} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function PhotoCard({ post, large }: { post: PostSummary; large?: boolean }) {
  return (
    <Link
      href={`/news/center-news/${post.id}`}
      className="group relative block h-full min-h-48 overflow-hidden rounded-2xl bg-muted"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.thumbnailUrl ?? ""}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p
          className={
            large ? "line-clamp-2 text-xl font-bold" : "line-clamp-2 text-sm font-semibold"
          }
        >
          {post.title}
        </p>
        <p className="mt-1 text-xs text-white/75">{formatDate(post.publishedAt)}</p>
      </div>
    </Link>
  );
}
