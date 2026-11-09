import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deleteHeroSlideAction } from "@/lib/actions/content.actions";
import { requireAdmin } from "@/lib/auth/guard";
import * as postRepository from "@/lib/repositories/post.repository";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "사진 수정" };

export default function EditHeroPage(props: PageProps<"/admin/hero/[id]">) {
  return (
    <AdminSuspense>
      <Content {...props} />
    </AdminSuspense>
  );
}

async function Content({ params }: PageProps<"/admin/hero/[id]">) {
  await requireAdmin();
  const slide = await settingsRepository.findHeroSlide(Number((await params).id));
  if (!slide) notFound();
  return (
    <>
      <AdminPageHeader
        title="메인 상단 대표 사진 수정"
        actions={
          <form action={deleteHeroSlideAction.bind(null, slide.id)}>
            <ConfirmSubmitButton message="이 사진을 메인 상단에서 삭제하시겠습니까?">
              삭제
            </ConfirmSubmitButton>
          </form>
        }
      />
      <HeroSlideForm slide={slide} galleryPosts={await postRepository.listGalleryPicks()} />
    </>
  );
}
