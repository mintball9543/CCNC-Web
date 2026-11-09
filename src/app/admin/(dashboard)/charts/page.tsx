import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { requireAdmin } from "@/lib/auth/guard";
import { CHART_SLUGS } from "@/lib/config/charts";
import * as settingsRepository from "@/lib/repositories/settings.repository";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "도표 관리" };

export default function ChartsAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="도표 관리"
        description="표에 수치를 입력하면 홈페이지 도표가 자동으로 그려집니다. 새 자료는 행을 추가해 갱신하세요. (가로축은 연도·지역·부문 등 자유롭게 지정)"
        actions={
          <ButtonLink href="/admin/charts/new">
            <Plus className="size-4" aria-hidden />새 도표
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
  const charts = await settingsRepository.listCharts();
  const pageOf = (slug: string) =>
    slug === CHART_SLUGS.emissions ? "충남 탄소중립 > 배출현황" : null;
  if (charts.length === 0) return <EmptyState title="등록된 도표가 없습니다." />;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-border bg-muted/60 text-left">
          <tr>
            <th scope="col" className="px-4 py-3">
              제목
            </th>
            <th scope="col" className="px-4 py-3">
              키 / 표시 위치
            </th>
            <th scope="col" className="px-4 py-3">
              데이터
            </th>
            <th scope="col" className="px-4 py-3">
              상태
            </th>
            <th scope="col" className="px-4 py-3">
              수정일
            </th>
          </tr>
        </thead>
        <tbody>
          {charts.map((c) => (
            <tr key={c.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/charts/${c.id}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {c.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                <code>{c.slug}</code>
                {pageOf(c.slug) && <span className="block">{pageOf(c.slug)}</span>}
                {c.showOnHome && <span className="block">메인 화면</span>}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {c.rows.length}행 × {c.series.length}계열
              </td>
              <td className="px-4 py-3">
                <Badge tone={c.isPublished ? "primary" : "neutral"}>
                  {c.isPublished ? "공개" : "비공개"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {"updatedAt" in c ? formatDate(c.updatedAt as Date) : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
