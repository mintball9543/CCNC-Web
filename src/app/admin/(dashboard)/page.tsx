import Link from "next/link";
import { InquiryTable } from "@/components/inquiry/inquiry-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/feedback";
import { requireAdmin } from "@/lib/auth/guard";
import { boardList } from "@/lib/config/boards";
import * as inquiryRepository from "@/lib/repositories/inquiry.repository";
import * as popupRepository from "@/lib/repositories/popup.repository";
import * as postRepository from "@/lib/repositories/post.repository";

export const metadata = { title: "대시보드" };

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [postCounts, pendingCount, popups, pending] = await Promise.all([
    postRepository.countPostsByBoard(),
    inquiryRepository.countPendingInquiries(),
    popupRepository.listAllPopups(),
    inquiryRepository.listInquiries({ status: "pending", pageSize: 5 }),
  ]);
  const activePopups = popups.filter((p) => p.isActive).length;

  const stats = [
    { label: "답변 대기 문의", value: pendingCount, href: "/admin/inquiries?status=pending" },
    { label: "사용 중 팝업", value: `${activePopups} / ${popups.length}`, href: "/admin/popups" },
    ...boardList.map((b) => ({
      label: b.title,
      value: postCounts[b.key] ?? 0,
      href: `/admin/boards/${b.key}`,
    })),
  ];

  return (
    <>
      <AdminPageHeader title="대시보드" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition hover:border-primary">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-3xl font-bold">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">답변 대기 중인 문의</h2>
        <InquiryTable
          items={pending.items}
          startNumber={pending.total}
          hrefFor={(item) => `/admin/inquiries/${item.id}`}
        />
      </section>
    </>
  );
}
