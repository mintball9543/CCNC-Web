import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ChartEditor } from "@/components/admin/chart-editor";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deleteChartAction } from "@/lib/actions/content.actions";
import { requireAdmin } from "@/lib/auth/guard";
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
      <ChartEditor chart={chart} />
    </>
  );
}
