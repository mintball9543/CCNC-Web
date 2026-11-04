import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata = { title: "사진 추가" };

export default function NewHeroPage() {
  return (
    <>
      <AdminPageHeader title="메인 비주얼 사진 추가" />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  return <HeroSlideForm />;
}
