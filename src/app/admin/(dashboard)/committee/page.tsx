import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { requireAdmin } from "@/lib/auth/guard";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "운영위원회" };

export default function CommitteeAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="운영위원회"
        description="센터소개 > 조직·업무 페이지의 운영위원 명단과 조직도의 '운영위원회' 인원수를 관리합니다."
        actions={
          <ButtonLink href="/admin/committee/new">
            <Plus className="size-4" aria-hidden />
            운영위원 추가
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
  const members = await settingsRepository.listCommitteeMembers();
  if (members.length === 0)
    return (
      <EmptyState
        title="등록된 운영위원이 없습니다."
        description="'운영위원 추가'로 위원을 등록하세요."
      />
    );
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-border bg-muted/60 text-left">
          <tr>
            <th scope="col" className="px-4 py-3">
              순서
            </th>
            <th scope="col" className="px-4 py-3">
              성명
            </th>
            <th scope="col" className="px-4 py-3">
              소속
            </th>
            <th scope="col" className="px-4 py-3">
              직위
            </th>
            <th scope="col" className="px-4 py-3">
              비고
            </th>
            <th scope="col" className="px-4 py-3">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 tabular-nums">{m.sortOrder}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/committee/${m.id}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {m.name}
                </Link>
              </td>
              <td className="px-4 py-3">{m.organization}</td>
              <td className="px-4 py-3">{m.position || "-"}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{m.note || "-"}</td>
              <td className="px-4 py-3">{!m.isVisible && <Badge>숨김</Badge>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
