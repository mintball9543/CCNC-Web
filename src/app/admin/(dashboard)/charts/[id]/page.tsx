import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ChartEditor, type ChartPlacementHolders } from "@/components/admin/chart-editor";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deleteChartAction } from "@/lib/actions/content.actions";
import { requireAdmin } from "@/lib/auth/guard";
import { chartPlacementOf } from "@/lib/config/charts";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "도표 수정" };

export default function EditChartPage(props: PageProps<"/admin/charts/[id]">) {
  return (
    <AdminSuspense>
      <Content {...props} />
    </AdminSuspense>
  );
}

async function Content({ params }: PageProps<"/admin/charts/[id]">) {
  await requireAdmin();
  const chart = await settingsRepository.findChart(Number((await params).id));
  if (!chart) notFound();
  return (
    <>
      <AdminPageHeader
        title="도표 수정"
        actions={
          <form action={deleteChartAction.bind(null, chart.id)}>
            <ConfirmSubmitButton message="이 도표를 삭제하시겠습니까?">삭제</ConfirmSubmitButton>
          </form>
        }
      />
      <ChartEditor chart={chart} holders={await placementHolders()} />
    </>
  );
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
