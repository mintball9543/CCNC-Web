import type { CSSProperties } from "react";
import { COLLABORATING_INSTITUTIONS } from "@/lib/content/center-plan";
import { buildOrgChart, committeeSizeLabel, dutyLines, type OrgTeam } from "@/lib/utils/org-chart";
import type { OrgMember } from "@/types";

/** 직위 「이름」 표시 */
function Person({ member, tone = "soft" }: { member: OrgMember; tone?: "soft" | "light" }) {
  return (
    <span
      className={
        tone === "light"
          ? "inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold"
          : "inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-foreground"
      }
    >
      <span className="font-medium opacity-80">{member.position}</span>
      <span>「{member.name}」</span>
    </span>
  );
}

function SideBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="font-bold text-primary">{title}</p>
      <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

function TeamCard({ team }: { team: OrgTeam }) {
  return (
    <article
      aria-label={`${team.name} 팀`}
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <h3 className="bg-primary px-5 py-3 text-lg font-bold text-primary-foreground">
        {team.name}
      </h3>
      <div className="flex-1 space-y-4 p-5">
        {team.members.map((m) => {
          const duties = dutyLines(m.duties);
          return (
            <div key={m.id} className="space-y-2.5">
              <Person member={m} />
              {duties.length > 0 && (
                <ul className="space-y-1 text-sm leading-relaxed">
                  {duties.map((d) => (
                    <li key={d} className="relative pl-3.5">
                      <span
                        className="absolute top-[0.65em] left-0 size-1.5 rounded-full bg-primary/60"
                        aria-hidden
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

/**
 * 센터 조직도 — 센터장 → 직속(사무국장) → 팀별 칸.
 * 왼쪽에는 공동 연구(지원) 인력, 오른쪽에는 운영위원회·협력 연구기관을 점선으로 연결한다.
 * 구성원은 관리자 > 조직도, 운영위원회 인원은 관리자 > 운영위원회에서 바꾼다.
 */
export function OrgChartView({
  members,
  committeeCount,
}: {
  members: OrgMember[];
  committeeCount: number;
}) {
  const { heads, direct, teams, support } = buildOrgChart(members);
  const committeeLabel = committeeSizeLabel(committeeCount);
  // 팀이 4개 이하일 때만 한 줄로 이어 그린다
  const columns = Math.min(Math.max(teams.length, 1), 4);
  const connected = teams.length >= 1 && teams.length <= 4;

  return (
    <div className="space-y-0">
      {/* 1단: 센터장 + 양옆 상자 */}
      <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:gap-0">
        <div className="order-2 lg:order-none lg:flex lg:w-[25%] lg:items-center">
          {support.length > 0 && (
            <>
              <div className="min-w-0 flex-1">
                <SideBox title="공동 연구(지원)">
                  <p>연구원 겸직 인력</p>
                  <p className="mt-2 font-semibold text-foreground">
                    {support.map((s) => s.name).join(" · ")}
                  </p>
                </SideBox>
              </div>
              <div
                className="hidden h-0 w-5 shrink-0 border-t-2 border-dashed border-primary/50 lg:block"
                aria-hidden
              />
            </>
          )}
        </div>

        <div className="order-1 flex flex-1 flex-col items-center gap-3 lg:order-none">
          {heads.map((head) => (
            <div
              key={head.id}
              className="w-full max-w-md rounded-2xl bg-ci-navy px-6 py-5 text-center text-white shadow-md"
            >
              <p className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-sm font-semibold">
                {head.position}
              </p>
              <p className="mt-1.5 text-3xl font-bold tracking-wide">{head.name}</p>
              {head.duties && (
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-white/80">
                  {head.duties}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="order-3 lg:order-none lg:flex lg:w-[25%] lg:items-center">
          <div
            className="hidden h-0 w-5 shrink-0 border-t-2 border-dashed border-primary/50 lg:block"
            aria-hidden
          />
          <div className="min-w-0 flex-1 space-y-3">
            {committeeLabel && (
              <SideBox title="운영위원회">
                <p className="font-semibold text-foreground">{committeeLabel}</p>
              </SideBox>
            )}
            <SideBox title="협력 연구기관">
              <p>{COLLABORATING_INSTITUTIONS}</p>
            </SideBox>
          </div>
        </div>
      </div>

      {/* 2단: 직속 */}
      {direct.length > 0 && (
        <div className="flex flex-col items-center">
          {heads.length > 0 && <div className="h-7 w-0.5 bg-primary/40" aria-hidden />}
          <div className="flex flex-wrap justify-center gap-3">
            {direct.map((d) => (
              <div
                key={d.id}
                className="min-w-64 rounded-2xl bg-primary px-6 py-4 text-center text-primary-foreground shadow"
              >
                <Person member={d} tone="light" />
                {dutyLines(d.duties).length > 0 && (
                  <p className="mt-2 text-sm leading-relaxed opacity-90">
                    {dutyLines(d.duties).join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3단: 팀 */}
      {teams.length > 0 && (
        <div className="flex flex-col items-center">
          {(direct.length > 0 || heads.length > 0) && (
            <div className="h-7 w-0.5 bg-primary/40" aria-hidden />
          )}
          <div className="relative w-full" style={{ "--cols": columns } as CSSProperties}>
            {connected && (
              <div
                className="absolute top-0 hidden h-0.5 bg-primary/40 lg:block"
                style={{
                  left: `${50 / columns}%`,
                  right: `${50 / columns}%`,
                }}
                aria-hidden
              />
            )}
            <ul className="grid gap-5 pt-0 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))] lg:pt-7">
              {teams.map((team) => (
                <li key={team.name} className="relative">
                  {connected && (
                    <span
                      className="absolute -top-7 left-1/2 hidden h-7 w-0.5 -translate-x-1/2 bg-primary/40 lg:block"
                      aria-hidden
                    />
                  )}
                  <TeamCard team={team} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
