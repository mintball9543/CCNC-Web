import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { HomeSectionsForm } from "@/components/admin/home-sections-form";
import { requireAdmin } from "@/lib/auth/guard";
import { normalizeHomeSectionOrder } from "@/lib/config/home-sections";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "메인 화면 순서" };

export default function HomeSectionsPage() {
  return (
    <>
      <AdminPageHeader
        title="메인 화면 순서"
        description="메인 비주얼 아래에 나오는 영역의 순서를 바꿉니다. 저장하면 바로 반영됩니다."
      />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  const order = normalizeHomeSectionOrder(await settingsRepository.findHomeSectionOrder());
  return <HomeSectionsForm order={order} />;
}
