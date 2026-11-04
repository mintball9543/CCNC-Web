import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { InquiryTable } from "@/components/inquiry/inquiry-table";
import { Pagination } from "@/components/ui/pagination";
import { requireAdmin } from "@/lib/auth/guard";
import * as inquiryRepository from "@/lib/repositories/inquiry.repository";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "문의 관리" };

const filters = [
  { value: undefined, label: "전체" },
  { value: "pending", label: "답변대기" },
  { value: "answered", label: "답변완료" },
] as const;

export default function AdminInquiriesPage(props: PageProps<"/admin/inquiries">) {
  return (
    <>
      <AdminPageHeader
        title="문의 관리"
        description="문의 내용 확인 및 답변 등록·수정·삭제, 답변 알림 메일 발송"
      />
      <AdminSuspense>
        <Content {...props} />
      </AdminSuspense>
    </>
  );
}

async function Content({ searchParams }: PageProps<"/admin/inquiries">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = sp.status === "pending" || sp.status === "answered" ? sp.status : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await inquiryRepository.listInquiries({ page, status, pageSize: 20 });
  const href = (p: number, s = status) => {
    const qs = new URLSearchParams();
    if (s) qs.set("status", s);
    if (p > 1) qs.set("page", String(p));
    const q = qs.toString();
    return q ? `/admin/inquiries?${q}` : "/admin/inquiries";
  };

  return (
    <>
      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={href(1, f.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              status === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <div className="rounded-xl bg-card p-4">
        <InquiryTable
          items={result.items}
          startNumber={result.total - (result.page - 1) * result.pageSize}
          hrefFor={(item) => `/admin/inquiries/${item.id}`}
        />
        <Pagination page={result.page} totalPages={result.totalPages} hrefFor={(p) => href(p)} />
      </div>
    </>
  );
}
