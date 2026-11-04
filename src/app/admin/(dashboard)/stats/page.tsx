import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { StatForm } from "@/components/admin/stat-form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deleteStatAction } from "@/lib/actions/content.actions";
import { requireAdmin } from "@/lib/auth/guard";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "숫자로 보는 센터" };

export default function StatsPage() {
  return (
    <>
      <AdminPageHeader
        title="숫자로 보는 센터"
        description="메인 화면에 표시되는 주요 실적 수치입니다(예: 교육 횟수, 참여 인원). 실제 집계된 수치만 입력하세요."
      />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  const stats = await settingsRepository.listStats();
  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {stats.map((stat) => (
          <li
            key={stat.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-start"
          >
            <div className="flex-1">
              <StatForm stat={stat} />
            </div>
            <form action={deleteStatAction.bind(null, stat.id)} className="lg:pt-5">
              <ConfirmSubmitButton message={`'${stat.label}' 항목을 삭제하시겠습니까?`}>
                삭제
              </ConfirmSubmitButton>
            </form>
          </li>
        ))}
      </ul>
      <section className="rounded-xl border border-dashed border-border p-4">
        <h2 className="mb-3 font-semibold">새 항목</h2>
        <StatForm key={stats.length} />
      </section>
    </div>
  );
}
