import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/feedback";
import { getCategoryLabel } from "@/lib/config/boards";
import { formatDate } from "@/lib/utils/format";
import type { Post, UploadedFile } from "@/types";
import { AttachmentList } from "./attachment-list";
import { PostContent } from "./post-content";

export function PostDetail({
  post,
  attachments,
  listHref,
}: {
  post: Post;
  attachments: UploadedFile[];
  listHref: string;
}) {
  const category = getCategoryLabel(post.boardKey, post.category);
  return (
    <article>
      <header className="border-t-2 border-b border-foreground border-b-border px-1 py-5">
        <div className="flex items-center gap-2">
          {category && <Badge>{category}</Badge>}
          <h2 className="text-xl font-bold">{post.title}</h2>
        </div>
        <dl className="mt-3 flex gap-4 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <dt>작성자</dt>
            <dd className="text-foreground">{post.author}</dd>
          </div>
          <div className="flex gap-1">
            <dt>등록일</dt>
            <dd className="text-foreground">{formatDate(post.publishedAt)}</dd>
          </div>
        </dl>
      </header>
      <div className="space-y-8 border-b border-border px-1 py-8">
        <AttachmentList files={attachments} />
        <div className="min-h-32">
          <PostContent post={post} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <ButtonLink href={listHref} variant="secondary">
          목록
        </ButtonLink>
      </div>
    </article>
  );
}
