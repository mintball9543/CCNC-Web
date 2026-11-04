import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { requireAdmin } from "@/lib/auth/guard";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "조직도" };

export default function OrganizationAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="조직도"
        description="센터소개 > 조직·업무 페이지의 조직도와 담당 업무·연락처를 관리합니다."
        actions={
          <ButtonLink href="/admin/organization/new">
            <Plus className="size-4" aria-hidden />
            구성원 추가
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
  const members = await settingsRepository.listOrgMembers();
  if (members.length === 0)
    return (
      <EmptyState
        title="등록된 구성원이 없습니다."
        description="'구성원 추가'로 센터장·팀·운영위원회 구성원을 등록하세요."
      />
    );
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-border bg-muted/60 text-left">
          <tr>
            <th scope="col" className="px-4 py-3">
              소속
            </th>
            <th scope="col" className="px-4 py-3">
              직위
            </th>
            <th scope="col" className="px-4 py-3">
              성명
            </th>
            <th scope="col" className="px-4 py-3">
              연락처
            </th>
            <th scope="col" className="px-4 py-3">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">{m.department}</td>
              <td className="px-4 py-3">{m.position}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/organization/${m.id}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {m.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {[m.phone, m.email].filter(Boolean).join(" · ") || "-"}
              </td>
              <td className="space-x-1 px-4 py-3">
                {m.isHead && <Badge tone="primary">최상단</Badge>}
                {!m.isVisible && <Badge>숨김</Badge>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
