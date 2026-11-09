import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";
import { requireAdmin } from "@/lib/auth/guard";
import * as postRepository from "@/lib/repositories/post.repository";

export const metadata = { title: "사진 추가" };

export default function NewHeroPage() {
  return (
    <>
      <AdminPageHeader title="메인 상단 대표 사진 추가" />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  return <HeroSlideForm galleryPosts={await postRepository.listGalleryPicks()} />;
}
