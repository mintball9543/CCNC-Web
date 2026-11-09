import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ChartEditor, type ChartPlacementHolders } from "@/components/admin/chart-editor";
import { requireAdmin } from "@/lib/auth/guard";
import { chartPlacementOf } from "@/lib/config/charts";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "새 도표" };

export default function NewChartPage() {
  return (
    <>
      <AdminPageHeader title="새 도표" />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  return <ChartEditor holders={await placementHolders()} />;
}

/** 메뉴별로 현재 표시 중인 도표 — 도표 편집기의 '표시할 메뉴' 안내용 */
async function placementHolders(): Promise<ChartPlacementHolders> {
  const charts = await settingsRepository.listCharts();
  return Object.fromEntries(
    charts
      .filter((c) => chartPlacementOf(c.slug))
      .map((c) => [c.slug, { id: c.id, title: c.title }]),
  );
}
