import Link from "next/link";
import { Pin } from "lucide-react";
import { RowCheckbox, SelectAllCheckbox } from "@/components/admin/bulk-delete-form";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { getCategoryLabel } from "@/lib/config/boards";
import { formatDate } from "@/lib/utils/format";
import type { BoardKey, PostSummary } from "@/types";

/** 게시글 목록 (공개/관리자 공용) */
export function PostTable({
  boardKey,
  posts,
  startNumber,
  hrefFor,
  emptyText = "등록된 게시글이 없습니다.",
  selectable = false,
}: {
  boardKey: BoardKey;
  posts: PostSummary[];
  /** 첫 행 번호 (전체 건수 기준 역순) */
  startNumber: number;
  hrefFor: (post: PostSummary) => string;
  emptyText?: string;
  /** 관리자 선택 삭제용 체크박스 표시 (BulkDeleteForm 안에서 사용) */
  selectable?: boolean;
}) {
  if (posts.length === 0) return <EmptyState title={emptyText} />;

  return (
    <div className="border-t-2 border-foreground">
      <table className="w-full text-sm">
        <caption className="sr-only">게시글 목록</caption>
        <thead className="hidden border-b border-border bg-muted/60 sm:table-header-group">
          <tr>
            {selectable && (
              <th scope="col" className="w-10 py-3">
                <SelectAllCheckbox />
              </th>
            )}
            <th scope="col" className="w-20 py-3 font-medium">
              번호
            </th>
            <th scope="col" className="py-3 font-medium">
              제목
            </th>
            <th scope="col" className="w-28 py-3 font-medium">
              작성자
            </th>
            <th scope="col" className="w-28 py-3 font-medium">
              등록일
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, i) => {
            const category = getCategoryLabel(boardKey, post.category);
            return (
              <tr
                key={post.id}
                className="flex flex-wrap items-center border-b border-border sm:table-row"
              >
                {selectable && (
                  <td className="pt-4 pr-2 pl-1 sm:py-4 sm:text-center">
                    <RowCheckbox id={post.id} label={post.title} />
                  </td>
                )}
                <td className="hidden py-4 text-center text-muted-foreground sm:table-cell">
                  {post.isPinned ? (
                    <Badge tone="primary">
                      <Pin className="mr-0.5 size-3" aria-hidden />
                      공지
                    </Badge>
                  ) : (
                    startNumber - i
                  )}
                </td>
                <td
                  className={
                    selectable
                      ? "flex-1 px-1 pt-4 pb-1 sm:w-auto sm:py-4"
                      : "w-full px-1 pt-4 pb-1 sm:w-auto sm:py-4"
                  }
                >
                  <Link href={hrefFor(post)} className="group flex items-center gap-2">
                    {post.isPinned && (
                      <Badge tone="primary" className="sm:hidden">
                        공지
                      </Badge>
                    )}
                    {category && <Badge>{category}</Badge>}
                    <span className="line-clamp-1 text-[15px] font-medium group-hover:text-primary group-hover:underline sm:text-base">
                      {post.title}
                    </span>
                  </Link>
                </td>
                <td className="px-1 pb-4 text-xs text-muted-foreground sm:py-4 sm:text-center sm:text-sm">
                  {post.author}
                </td>
                <td className="px-1 pb-4 text-xs text-muted-foreground sm:py-4 sm:text-center sm:text-sm">
                  <span className="mx-1 sm:hidden">·</span>
                  {formatDate(post.publishedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
