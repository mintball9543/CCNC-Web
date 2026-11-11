import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { OrgMemberForm } from "@/components/admin/org-member-form";
import { requireAdmin } from "@/lib/auth/guard";
import * as settingsRepository from "@/lib/repositories/settings.repository";
import { departmentsOf } from "@/lib/utils/org-departments";

export const metadata = { title: "구성원 추가" };

export default function NewOrgMemberPage() {
  return (
    <>
      <AdminPageHeader title="구성원 추가" />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  const departments = departmentsOf(await settingsRepository.listOrgMembers());
  return <OrgMemberForm departments={departments} />;
}
