import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { requireAdmin } from "@/lib/auth/guard";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "메인 비주얼" };

export default function HeroAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="메인 비주얼(사진)"
        description="메인 화면 상단 슬라이드 사진입니다. 직접 올리거나 활동 갤러리 게시글에서 가져올 수 있고, 갤러리 글쓰기에서 '메인 비주얼에도 표시'를 선택해도 추가됩니다. 사진이 없으면 기본 디자인이 표시됩니다."
        actions={
          <ButtonLink href="/admin/hero/new">
            <Plus className="size-4" aria-hidden />
            사진 추가
          </ButtonLink>
        }
      />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  const slides = await settingsRepository.listHeroSlides();
  if (slides.length === 0)
    return (
      <EmptyState
        title="등록된 사진이 없습니다."
        description="사진을 직접 올리거나 활동 갤러리 게시글에서 가져와 메인 화면을 꾸며 보세요."
      />
    );
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {slides.map((s) => (
        <li key={s.id}>
          <Link
            href={`/admin/hero/${s.id}`}
            className="group block overflow-hidden rounded-xl border border-border bg-card hover:border-primary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.imageUrl} alt={s.imageAlt} className="aspect-[16/7] w-full object-cover" />
            <div className="flex items-center justify-between gap-2 p-3 text-sm">
              <span className="truncate font-medium">{s.title || s.imageAlt}</span>
              <span className="flex shrink-0 gap-1">
                {s.postId && <Badge tone="warning">갤러리 연동</Badge>}
                <Badge>순서 {s.sortOrder}</Badge>
                <Badge tone={s.isActive ? "primary" : "neutral"}>
                  {s.isActive ? "표시" : "숨김"}
                </Badge>
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
