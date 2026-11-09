import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { RelatedSiteForm } from "@/components/admin/related-site-form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deleteRelatedSiteAction } from "@/lib/actions/content.actions";
import { requireAdmin } from "@/lib/auth/guard";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "관련 사이트 수정" };

export default function EditRelatedSitePage(props: PageProps<"/admin/related-sites/[id]">) {
  return (
    <AdminSuspense>
      <Content {...props} />
    </AdminSuspense>
  );
}

async function Content({ params }: PageProps<"/admin/related-sites/[id]">) {
  await requireAdmin();
  const site = await settingsRepository.findRelatedSite(Number((await params).id));
  if (!site) notFound();
  return (
    <>
      <AdminPageHeader
        title="관련 사이트 수정"
        actions={
          <form action={deleteRelatedSiteAction.bind(null, site.id)}>
            <ConfirmSubmitButton message={`${site.name}을(를) 관련 사이트에서 삭제하시겠습니까?`}>
              삭제
            </ConfirmSubmitButton>
          </form>
        }
      />
      <RelatedSiteForm site={site} />
    </>
  );
}
