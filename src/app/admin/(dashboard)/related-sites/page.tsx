import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { requireAdmin } from "@/lib/auth/guard";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "관련 사이트" };

export default function RelatedSitesAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="관련 사이트"
        description="메인 화면 하단에 로고와 함께 표시되는 관련 기관 사이트입니다. 주소나 로고가 바뀌면 여기서 수정하세요."
        actions={
          <ButtonLink href="/admin/related-sites/new">
            <Plus className="size-4" aria-hidden />
            사이트 추가
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
  const sites = await settingsRepository.listRelatedSites();
  if (sites.length === 0) return <EmptyState title="등록된 관련 사이트가 없습니다." />;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {sites.map((site) => (
        <li key={site.id}>
          <Link
            href={`/admin/related-sites/${site.id}`}
            className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-3 transition hover:border-primary"
          >
            <span className="flex aspect-[266/65] items-center justify-center overflow-hidden rounded bg-white px-2">
              {site.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={site.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-sm font-bold text-ci-navy">{site.name}</span>
              )}
            </span>
            <span className="truncate text-sm font-medium">{site.name}</span>
            <span className="truncate text-xs text-muted-foreground">{site.url}</span>
            <span className="flex gap-1">
              <Badge>순서 {site.sortOrder}</Badge>
              <Badge tone={site.isVisible ? "primary" : "neutral"}>
                {site.isVisible ? "표시" : "숨김"}
              </Badge>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
