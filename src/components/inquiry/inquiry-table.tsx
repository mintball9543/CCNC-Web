import Link from "next/link";
import { Lock } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { formatDate } from "@/lib/utils/format";
import type { InquirySummary } from "@/types";

export function InquiryStatusBadge({ status }: { status: InquirySummary["status"] }) {
  return status === "answered" ? (
    <Badge tone="primary">답변완료</Badge>
  ) : (
    <Badge tone="warning">답변대기</Badge>
  );
}

export function InquiryTable({
  items,
  startNumber,
  hrefFor,
}: {
  items: InquirySummary[];
  startNumber: number;
  hrefFor: (item: InquirySummary) => string;
}) {
  if (items.length === 0) return <EmptyState title="등록된 문의가 없습니다." />;
  return (
    <div className="border-t-2 border-foreground">
      <table className="w-full text-sm">
        <caption className="sr-only">문의 목록</caption>
        <thead className="hidden border-b border-border bg-muted/60 sm:table-header-group">
          <tr>
            <th scope="col" className="w-20 py-3 font-medium">
              번호
            </th>
            <th scope="col" className="py-3 font-medium">
              제목
            </th>
            <th scope="col" className="w-24 py-3 font-medium">
              작성자
            </th>
            <th scope="col" className="w-28 py-3 font-medium">
              등록일
            </th>
            <th scope="col" className="w-24 py-3 font-medium">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.id}
              className="flex flex-wrap items-center border-b border-border sm:table-row"
            >
              <td className="hidden py-4 text-center text-muted-foreground sm:table-cell">
                {startNumber - i}
              </td>
              <td className="w-full px-1 pt-4 pb-1 sm:w-auto sm:py-4">
                <Link
                  href={hrefFor(item)}
                  className="flex items-center gap-1.5 font-medium hover:text-primary hover:underline"
                >
                  {item.isPrivate && (
                    <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-label="비공개" />
                  )}
                  <span className="line-clamp-1">{item.title}</span>
                </Link>
              </td>
              <td className="px-1 pb-4 text-xs text-muted-foreground sm:py-4 sm:text-center sm:text-sm">
                {item.maskedAuthor}
              </td>
              <td className="px-1 pb-4 text-xs text-muted-foreground sm:py-4 sm:text-center sm:text-sm">
                {formatDate(item.createdAt)}
              </td>
              <td className="ml-auto px-1 pb-4 sm:py-4 sm:text-center">
                <InquiryStatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
