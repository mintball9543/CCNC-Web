import { sanitizePostHtml } from "@/lib/content/sanitize";
import type { Post } from "@/types";

/** 게시글 본문 — HTML 은 출력 직전에 한 번 더 살균, 기존 텍스트 글은 줄바꿈만 유지 */
export function PostContent({ post }: { post: Pick<Post, "content" | "format"> }) {
  if (post.format === "html") {
    return (
      <div
        className="prose-ccnc"
        dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.content) }}
      />
    );
  }
  return <div className="leading-relaxed whitespace-pre-line">{post.content}</div>;
}
