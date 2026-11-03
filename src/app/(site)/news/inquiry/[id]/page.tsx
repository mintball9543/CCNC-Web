import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BoardSkeleton } from "@/components/board/board-skeleton";
import { InquiryAnswer } from "@/components/inquiry/inquiry-answer";
import { InquiryPasswordGate } from "@/components/inquiry/inquiry-password-gate";
import { InquiryStatusBadge } from "@/components/inquiry/inquiry-table";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { getPublicInquiry } from "@/lib/queries/inquiries";
import { formatDate } from "@/lib/utils/format";

export default function InquiryDetailPage(props: PageProps<"/news/inquiry/[id]">) {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <InquiryDetail {...props} />
    </Suspense>
  );
}

async function InquiryDetail({ params, searchParams }: PageProps<"/news/inquiry/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const inquiry = await getPublicInquiry(id);
  if (!inquiry) notFound();
  const justCreated = (await searchParams).created === "1";

  return (
    <article className="space-y-6">
      {justCreated && (
        <Alert tone="success">
          문의가 등록되었습니다. 답변이 등록되면 이 페이지에서 확인할 수 있습니다.
        </Alert>
      )}
      <header className="border-t-2 border-b border-foreground border-b-border px-1 py-5">
        <div className="flex items-center gap-2">
          <InquiryStatusBadge status={inquiry.status} />
          <h2 className="text-xl font-bold">{inquiry.title}</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {inquiry.maskedAuthor} · {formatDate(inquiry.createdAt)}
        </p>
      </header>

      {inquiry.isPrivate ? (
        <InquiryPasswordGate id={inquiry.id} />
      ) : (
        <>
          <div className="min-h-32 px-1 leading-relaxed whitespace-pre-line">{inquiry.content}</div>
          <InquiryAnswer answer={inquiry.answer} answeredAt={inquiry.answeredAt} />
        </>
      )}

      <div className="flex justify-end border-t border-border pt-6">
        <ButtonLink href="/news/inquiry" variant="secondary">
          목록
        </ButtonLink>
      </div>
    </article>
  );
}
