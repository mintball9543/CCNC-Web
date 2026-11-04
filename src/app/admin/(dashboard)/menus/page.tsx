import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { MenuSettingsForm } from "@/components/admin/menu-settings-form";
import { requireAdmin } from "@/lib/auth/guard";
import { mainNavigation } from "@/lib/config/navigation";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "메뉴 표시 설정" };

export default function MenusPage() {
  return (
    <>
      <AdminPageHeader
        title="메뉴 표시 설정"
        description="대메뉴 전체 또는 하위 메뉴를 홈페이지에서 숨기거나 다시 표시합니다."
      />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  const settings = await settingsRepository.listMenuSettings();
  return <MenuSettingsForm navigation={mainNavigation} settings={settings} />;
}
