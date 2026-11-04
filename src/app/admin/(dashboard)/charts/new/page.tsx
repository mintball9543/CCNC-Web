import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ChartEditor } from "@/components/admin/chart-editor";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata = { title: "새 도표" };

export default function NewChartPage() {
  return (
    <>
      <AdminPageHeader title="새 도표" />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  return <ChartEditor />;
}
