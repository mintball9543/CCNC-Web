import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { OrgMemberForm } from "@/components/admin/org-member-form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deleteOrgMemberAction } from "@/lib/actions/content.actions";
import { requireAdmin } from "@/lib/auth/guard";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "구성원 수정" };

export default function EditOrgMemberPage(props: PageProps<"/admin/organization/[id]">) {
  return (
    <AdminSuspense>
      <Content {...props} />
    </AdminSuspense>
  );
}

async function Content({ params }: PageProps<"/admin/organization/[id]">) {
  await requireAdmin();
  const member = await settingsRepository.findOrgMember(Number((await params).id));
  if (!member) notFound();
  const departments = [
    ...new Set((await settingsRepository.listOrgMembers()).map((m) => m.department)),
  ];
  return (
    <>
      <AdminPageHeader
        title="구성원 수정"
        actions={
          <form action={deleteOrgMemberAction.bind(null, member.id)}>
            <ConfirmSubmitButton message="이 구성원을 삭제하시겠습니까?">삭제</ConfirmSubmitButton>
          </form>
        }
      />
      <OrgMemberForm member={member} departments={departments} />
    </>
  );
}
