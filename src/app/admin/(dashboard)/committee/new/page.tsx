import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CommitteeMemberForm } from "@/components/admin/committee-member-form";

export const metadata = { title: "운영위원 추가" };

export default function NewCommitteeMemberPage() {
  return (
    <>
      <AdminPageHeader title="운영위원 추가" />
      <CommitteeMemberForm />
    </>
  );
}
