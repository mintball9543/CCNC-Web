import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { PopupForm } from "@/components/admin/popup-form";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata = { title: "새 팝업" };

export default function NewPopupPage() {
  return (
    <>
      <AdminPageHeader title="새 팝업" />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  return <PopupForm />;
}
