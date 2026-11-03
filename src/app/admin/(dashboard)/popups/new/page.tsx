import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PopupForm } from "@/components/admin/popup-form";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata = { title: "새 팝업" };

export default async function NewPopupPage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader title="새 팝업" />
      <PopupForm />
    </>
  );
}
