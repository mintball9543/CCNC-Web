import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { RelatedSiteForm } from "@/components/admin/related-site-form";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata = { title: "관련 사이트 추가" };

export default function NewRelatedSitePage() {
  return (
    <>
      <AdminPageHeader title="관련 사이트 추가" />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  return <RelatedSiteForm />;
}
