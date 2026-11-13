import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { CommitteeMemberForm } from "@/components/admin/committee-member-form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deleteCommitteeMemberAction } from "@/lib/actions/content.actions";
import { requireAdmin } from "@/lib/auth/guard";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "운영위원 수정" };

export default function EditCommitteeMemberPage(props: PageProps<"/admin/committee/[id]">) {
  return (
    <AdminSuspense>
      <Content {...props} />
    </AdminSuspense>
  );
}

async function Content({ params }: PageProps<"/admin/committee/[id]">) {
  await requireAdmin();
  const member = await settingsRepository.findCommitteeMember(Number((await params).id));
  if (!member) notFound();
  return (
    <>
      <AdminPageHeader
        title="운영위원 수정"
        actions={
          <form action={deleteCommitteeMemberAction.bind(null, member.id)}>
            <ConfirmSubmitButton message="이 운영위원을 삭제하시겠습니까?">
              삭제
            </ConfirmSubmitButton>
          </form>
        }
      />
      <CommitteeMemberForm member={member} />
    </>
  );
}
