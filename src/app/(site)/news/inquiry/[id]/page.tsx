import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Suspense } from "react";
import { BoardSkeleton } from "@/components/board/board-skeleton";
import { InquiryAnswer } from "@/components/inquiry/inquiry-answer";
import { InquiryDeleteButton } from "@/components/inquiry/inquiry-delete-button";
import { InquiryPasswordGate } from "@/components/inquiry/inquiry-password-gate";
import { InquiryStatusBadge } from "@/components/inquiry/inquiry-table";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { getInquiryAuthorMode, getPublicInquiry } from "@/lib/queries/inquiries";
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
  const sp = await searchParams;

  return (
    <article className="space-y-6">
      {sp.created === "1" && (
        <Alert tone="success">
          문의가 등록되었습니다. 답변이 등록되면 이 페이지에서 확인할 수 있습니다. 답변 전까지는
          수정·삭제할 수 있습니다.
        </Alert>
      )}
      {sp.updated === "1" && <Alert tone="success">문의를 수정했습니다.</Alert>}
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
          {/* 작성자 본인 확인은 쿠키를 읽으므로 따로 스트리밍 */}
          <Suspense>
            <AuthorActions id={inquiry.id} />
          </Suspense>
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

/** 공개 문의의 작성자 수정·삭제 버튼 (답변 전까지) */
async function AuthorActions({ id }: { id: number }) {
  const mode = await getInquiryAuthorMode(id);
  if (mode === "none") return null;
  return (
    <div className="flex items-start justify-end gap-2">
      <ButtonLink href={`/news/inquiry/${id}/edit`} variant="secondary">
        <Pencil className="size-4" aria-hidden />
        {mode === "direct" ? "수정" : "수정·삭제 (비밀번호 확인)"}
      </ButtonLink>
      {mode === "direct" && <InquiryDeleteButton id={id} />}
    </div>
  );
}
