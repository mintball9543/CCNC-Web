import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { AnswerForm } from "@/components/admin/answer-form";
import { InquiryStatusBadge } from "@/components/inquiry/inquiry-table";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { Badge, Card } from "@/components/ui/feedback";
import { deleteAnswerAction, deleteInquiryAction } from "@/lib/actions/inquiry-admin.actions";
import { requireAdmin } from "@/lib/auth/guard";
import { isMailConfigured } from "@/lib/mail/mailer";
import * as inquiryRepository from "@/lib/repositories/inquiry.repository";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "문의 상세" };

export default function AdminInquiryPage(props: PageProps<"/admin/inquiries/[id]">) {
  return (
    <AdminSuspense>
      <Content {...props} />
    </AdminSuspense>
  );
}

async function Content({ params }: PageProps<"/admin/inquiries/[id]">) {
  await requireAdmin();
  const inquiry = await inquiryRepository.findInquiry(Number((await params).id));
  if (!inquiry) notFound();

  return (
    <>
      <AdminPageHeader
        title="문의 상세"
        actions={
          <>
            <ButtonLink href="/admin/inquiries" variant="secondary" size="sm">
              목록
            </ButtonLink>
            <form action={deleteInquiryAction.bind(null, inquiry.id)}>
              <ConfirmSubmitButton message="문의와 답변을 모두 삭제하시겠습니까?">
                문의 삭제
              </ConfirmSubmitButton>
            </form>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <InquiryStatusBadge status={inquiry.answeredAt ? "answered" : "pending"} />
            {inquiry.isPrivate && <Badge>비공개</Badge>}
            <h2 className="text-lg font-bold">{inquiry.title}</h2>
          </div>
          <dl className="mt-4 grid grid-cols-[5rem_1fr] gap-y-1 text-sm">
            <dt className="text-muted-foreground">작성자</dt>
            <dd>{inquiry.authorName}</dd>
            <dt className="text-muted-foreground">이메일</dt>
            <dd>
              <a href={`mailto:${inquiry.email}`} className="text-primary underline">
                {inquiry.email}
              </a>
            </dd>
            <dt className="text-muted-foreground">연락처</dt>
            <dd>{inquiry.phone ?? "-"}</dd>
            <dt className="text-muted-foreground">등록일</dt>
            <dd>{formatDateTime(inquiry.createdAt)}</dd>
          </dl>
          <div className="mt-6 border-t border-border pt-4 leading-relaxed whitespace-pre-line">
            {inquiry.content}
          </div>
        </Card>
        <Card className="space-y-4">
          {inquiry.answeredAt && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {inquiry.answeredBy} · {formatDateTime(inquiry.answeredAt)}
              </span>
              <form action={deleteAnswerAction.bind(null, inquiry.id)}>
                <ConfirmSubmitButton
                  message="답변을 삭제하시겠습니까? 문의는 '답변대기' 상태로 돌아갑니다."
                  variant="secondary"
                >
                  답변 삭제
                </ConfirmSubmitButton>
              </form>
            </div>
          )}
          <AnswerForm
            inquiryId={inquiry.id}
            answer={inquiry.answer}
            email={inquiry.email}
            mailConfigured={isMailConfigured()}
          />
          {inquiry.notifiedAt && (
            <p className="text-xs text-muted-foreground">
              알림 메일 발송: {formatDateTime(inquiry.notifiedAt)}
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
