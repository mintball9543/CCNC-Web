import Link from "next/link";
import { Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/form";
import { Pagination } from "@/components/ui/pagination";
import { AUDIT_CATEGORIES, categoryLabel, type AuditCategory } from "@/lib/audit/labels";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db/client";
import { listAuditLogs, summarizeIps } from "@/lib/repositories/audit.repository";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "작업 기록" };

const SUMMARY_DAYS = 30;

export default function AuditLogPage(props: PageProps<"/admin/logs">) {
  return (
    <>
      <AdminPageHeader
        title="작업 기록"
        description="관리자 페이지에 접속한 IP와, 어떤 IP가 무엇을 등록·수정·삭제했는지 기록합니다. 1년이 지난 기록은 자동으로 삭제됩니다."
      />
      <AdminSuspense>
        <Content {...props} />
      </AdminSuspense>
    </>
  );
}

const toneOf = (category: string, action: string) =>
  action === "auth.login_failed" || action === "auth.login_blocked" || action.endsWith("_failed")
    ? "warning"
    : category === "change"
      ? "primary"
      : "neutral";

async function Content({ searchParams }: PageProps<"/admin/logs">) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const ip = typeof sp.ip === "string" && sp.ip.trim() ? sp.ip.trim().slice(0, 64) : null;
  const category = AUDIT_CATEGORIES.some((c) => c.value === sp.category)
    ? (sp.category as AuditCategory)
    : null;

  const [result, ipSummary] = await Promise.all([
    listAuditLogs(db, { page, ip, category }),
    summarizeIps(db, SUMMARY_DAYS),
  ]);

  const href = (params: { page?: number; ip?: string | null; category?: string | null }) => {
    const qs = new URLSearchParams();
    const nextIp = params.ip === undefined ? ip : params.ip;
    const nextCategory = params.category === undefined ? category : params.category;
    if (nextIp) qs.set("ip", nextIp);
    if (nextCategory) qs.set("category", nextCategory);
    if (params.page && params.page > 1) qs.set("page", String(params.page));
    const q = qs.toString();
    return q ? `/admin/logs?${q}` : "/admin/logs";
  };

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="ip-summary-heading"
        className="rounded-xl border border-border bg-card p-4"
      >
        <h2 id="ip-summary-heading" className="mb-3 font-semibold">
          최근 {SUMMARY_DAYS}일 접속 IP
        </h2>
        {ipSummary.length === 0 ? (
          <p className="text-sm text-muted-foreground">기록이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th scope="col" className="py-2 font-medium">
                    IP
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    전체
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    변경
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    로그인 실패
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    마지막 접속
                  </th>
                </tr>
              </thead>
              <tbody>
                {ipSummary.map((row) => (
                  <tr key={row.ip} className="border-b border-border last:border-0">
                    <td className="py-2">
                      <Link
                        href={href({ ip: row.ip, page: 1 })}
                        className="font-mono text-primary hover:underline"
                      >
                        {row.ip}
                      </Link>
                    </td>
                    <td className="py-2 tabular-nums">{row.total}</td>
                    <td className="py-2 tabular-nums">{row.changes}</td>
                    <td
                      className={cn(
                        "py-2 tabular-nums",
                        row.failures > 0 && "font-semibold text-danger",
                      )}
                    >
                      {row.failures}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {row.lastSeen ? formatDateTime(row.lastSeen) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="log-list-heading" className="space-y-4">
        <h2 id="log-list-heading" className="sr-only">
          기록 목록
        </h2>
        <form action="/admin/logs" method="get" className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-muted-foreground">
            분류
            <Select name="category" defaultValue={category ?? ""} className="mt-1 w-40">
              <option value="">전체</option>
              {AUDIT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-xs text-muted-foreground">
            IP
            <Input
              name="ip"
              defaultValue={ip ?? ""}
              placeholder="예: 203.0.113.5"
              className="mt-1 w-48 font-mono"
            />
          </label>
          <Button type="submit" variant="secondary">
            <Search className="size-4" aria-hidden />
            조회
          </Button>
          {(ip || category) && (
            <Link
              href="/admin/logs"
              className="h-10 px-2 text-sm leading-10 text-muted-foreground hover:underline"
            >
              조건 지우기
            </Link>
          )}
        </form>

        <p className="text-sm text-muted-foreground">
          전체 {result.total.toLocaleString("ko-KR")}건
        </p>
        {result.items.length === 0 ? (
          <EmptyState title="기록이 없습니다." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-border bg-muted/60 text-left">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    일시
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    IP
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    분류
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    내용
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    페이지
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((log) => (
                  <tr key={log.id} className="border-b border-border align-top last:border-0">
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground tabular-nums">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <Link
                        href={href({ ip: log.ip, page: 1 })}
                        className="font-mono hover:text-primary hover:underline"
                      >
                        {log.ip}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <Badge tone={toneOf(log.category, log.action)}>
                        {categoryLabel(log.category)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <p>{log.summary}</p>
                      {log.userAgent && (
                        <p
                          className="mt-0.5 line-clamp-1 text-xs text-muted-foreground"
                          title={log.userAgent}
                        >
                          {log.userAgent}
                        </p>
                      )}
                    </td>
                    <td className="max-w-56 px-3 py-2.5 font-mono text-xs break-all text-muted-foreground">
                      {log.path ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          hrefFor={(p) => href({ page: p })}
        />
      </section>
    </div>
  );
}
