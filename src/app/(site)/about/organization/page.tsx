import { Mail, Phone } from "lucide-react";
import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { getOrgMembers } from "@/lib/queries/site";
import { navMetadata } from "@/lib/seo";
import type { OrgMember } from "@/types";

export const metadata = navMetadata("/about/organization");

/** 조직·업무 — 관리자 > 조직도에서 구성원·업무·연락처를 수정 */
export default async function Page() {
  const members = await getOrgMembers();
  if (members.length === 0) {
    return (
      <ContentPlaceholder
        issue="CONTENT-006"
        sections={[
          "조직도 (운영위원회 포함)",
          "부서·담당별 업무",
          "연락처 (기관 도메인 이메일로 통일)",
        ]}
        note="관리자 > 조직도 메뉴에서 구성원을 등록하면 이 페이지에 표시됩니다."
      />
    );
  }

  const heads = members.filter((m) => m.isHead);
  const departments = Array.from(
    members
      .filter((m) => !m.isHead)
      .reduce(
        (map, m) => map.set(m.department, [...(map.get(m.department) ?? []), m]),
        new Map<string, OrgMember[]>(),
      ),
  );

  return (
    <div className="space-y-12">
      <section aria-labelledby="org-chart-heading">
        <h2 id="org-chart-heading" className="sr-only">
          조직도
        </h2>
        <div className="flex flex-col items-center">
          {heads.map((head) => (
            <div
              key={head.id}
              className="rounded-2xl bg-primary px-8 py-4 text-center text-primary-foreground shadow"
            >
              <p className="text-sm opacity-90">{head.position}</p>
              <p className="text-lg font-bold">{head.name}</p>
            </div>
          ))}
          {heads.length > 0 && departments.length > 0 && (
            <div className="h-8 w-px bg-border" aria-hidden />
          )}
          {departments.length > 0 && (
            <ul className="relative grid w-full gap-4 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map(([department, list]) => (
                <li key={department} className="rounded-2xl border border-border bg-card p-5">
                  <p className="mb-3 border-b-2 border-primary pb-2 text-center font-bold">
                    {department}
                  </p>
                  <ul className="space-y-1 text-center text-sm">
                    {list.map((m) => (
                      <li key={m.id}>
                        <span className="text-muted-foreground">{m.position}</span> {m.name}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="duties-heading">
        <h2 id="duties-heading" className="mb-4 text-xl font-bold">
          업무 및 연락처
        </h2>
        <div className="overflow-x-auto border-t-2 border-foreground">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border bg-muted/60">
              <tr>
                <th scope="col" className="py-3">
                  소속
                </th>
                <th scope="col" className="py-3">
                  직위
                </th>
                <th scope="col" className="py-3">
                  성명
                </th>
                <th scope="col" className="py-3">
                  담당 업무
                </th>
                <th scope="col" className="py-3">
                  연락처
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-border">
                  <td className="px-2 py-3 text-center">{m.department}</td>
                  <td className="px-2 py-3 text-center">{m.position}</td>
                  <td className="px-2 py-3 text-center font-medium">{m.name}</td>
                  <td className="px-2 py-3 whitespace-pre-line text-muted-foreground">
                    {m.duties}
                  </td>
                  <td className="space-y-0.5 px-2 py-3 text-xs">
                    {m.phone && (
                      <a
                        href={`tel:${m.phone}`}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Phone className="size-3" aria-hidden />
                        {m.phone}
                      </a>
                    )}
                    {m.email && (
                      <a
                        href={`mailto:${m.email}`}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Mail className="size-3" aria-hidden />
                        {m.email}
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
