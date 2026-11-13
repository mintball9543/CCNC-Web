import { Mail, Phone } from "lucide-react";
import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { OrgChartView } from "@/components/content/org-chart";
import { CenterWorkAreas } from "@/components/content/plan-project";
import { getCommitteeMembers, getOrgMembers } from "@/lib/queries/site";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/about/organization");

/**
 * 조직·업무
 * - 조직도: 관리자 > 조직도 (구성원·소속·담당 업무), 운영위원회 인원: 관리자 > 운영위원회
 * - 분야별 주요 업무·운영위원회 소개: src/lib/content/center-plan.ts
 */
export default async function Page() {
  const [members, committee] = await Promise.all([getOrgMembers(), getCommitteeMembers()]);

  const withContact = members.filter((m) => m.phone || m.email);

  return (
    <div className="space-y-14">
      <section aria-labelledby="org-chart-heading">
        <h2 id="org-chart-heading" className="mb-6 text-xl font-bold">
          조직도
        </h2>
        {members.length === 0 ? (
          <ContentPlaceholder
            issue="CONTENT-006"
            sections={["센터장·직속·팀별 구성원", "담당 업무"]}
            note="관리자 > 조직도 메뉴에서 구성원을 등록하면 이 페이지에 표시됩니다."
          />
        ) : (
          <OrgChartView members={members} committeeCount={committee.length} />
        )}
      </section>

      {withContact.length > 0 && (
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="mb-4 text-xl font-bold">
            담당자 연락처
          </h2>
          <div className="overflow-x-auto border-t-2 border-foreground">
            <table className="w-full min-w-[480px] text-sm">
              <caption className="sr-only">담당자 연락처</caption>
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th scope="col" className="py-3">
                    직위
                  </th>
                  <th scope="col" className="py-3">
                    성명
                  </th>
                  <th scope="col" className="py-3">
                    연락처
                  </th>
                </tr>
              </thead>
              <tbody>
                {withContact.map((m) => (
                  <tr key={m.id} className="border-b border-border">
                    <td className="px-2 py-3 text-center">{m.position}</td>
                    <td className="px-2 py-3 text-center font-medium">{m.name}</td>
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
      )}

      <CenterWorkAreas committee={committee} />
    </div>
  );
}
