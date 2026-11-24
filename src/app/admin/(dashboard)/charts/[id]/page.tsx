import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ChartEditor } from "@/components/admin/chart-editor";
import { requireAdmin } from "@/lib/auth/guard";
import { systemChartOf } from "@/lib/config/charts";
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
  // 홈페이지에 들어간 도표·자료만 수정한다 (예전에 직접 만든 도표는 더 이상 쓰지 않음)
  const system = chart ? systemChartOf(chart.slug) : null;
  if (!chart || !system) notFound();
  return (
    <>
      <AdminPageHeader title={`도표 수정 — ${system.label}`} />
      <ChartEditor chart={chart} system={system} />
    </>
  );
}
