import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BoardSkeleton } from "@/components/board/board-skeleton";
import { InquiryDeleteButton } from "@/components/inquiry/inquiry-delete-button";
import { InquiryEditForm } from "@/components/inquiry/inquiry-edit-form";
import { InquiryPasswordGate } from "@/components/inquiry/inquiry-password-gate";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { AUTH_MESSAGES } from "@/lib/inquiry/permissions";
import { getInquiryForAuthorEdit, getPublicInquiry } from "@/lib/queries/inquiries";

export const metadata: Metadata = { title: "문의 수정", robots: { index: false } };

/** 작성자 본인의 문의 수정·삭제 (답변 전까지) */
export default function InquiryEditPage(props: PageProps<"/news/inquiry/[id]/edit">) {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <InquiryEdit {...props} />
    </Suspense>
  );
}

async function InquiryEdit({ params }: PageProps<"/news/inquiry/[id]/edit">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const summary = await getPublicInquiry(id);
  if (!summary) notFound();
  const { mode, inquiry } = await getInquiryForAuthorEdit(id);

  return (
    <div className="space-y-6">
      <h2 className="border-t-2 border-b border-foreground border-b-border px-1 py-5 text-xl font-bold">
        문의 수정
      </h2>

      {mode === "direct" && inquiry && (
        <>
          <InquiryEditForm inquiry={inquiry} />
          <div className="flex justify-end border-t border-border pt-4">
            <InquiryDeleteButton id={id} />
          </div>
        </>
      )}

      {mode === "password" && (
        <InquiryPasswordGate
          id={id}
          mode="edit"
          message="본인 확인을 위해 작성 시 입력한 비밀번호를 입력하세요."
        />
      )}

      {mode === "none" && (
        <>
          <Alert tone="info">
            {summary.status === "answered" ? AUTH_MESSAGES.answered : AUTH_MESSAGES["owner-only"]}
          </Alert>
          <div className="flex justify-end">
            <ButtonLink href={`/news/inquiry/${id}`} variant="secondary">
              돌아가기
            </ButtonLink>
          </div>
        </>
      )}
    </div>
  );
}
