import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Skeleton } from "@/components/ui/feedback";
import { logoutAction } from "@/lib/actions/auth.actions";
import { requireAdmin } from "@/lib/auth/guard";

/**
 * 관리자 공통 레이아웃.
 * 인증 확인(requireAdmin)은 각 페이지·Server Action 에서도 수행한다 (레이아웃만으로는 불충분).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-border bg-card lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between p-4 lg:block lg:p-5">
          <Link href="/admin" className="block">
            <Logo variant="horizontal" className="h-9" />
            <span className="sr-only">관리자 홈</span>
          </Link>
        </div>
        <div className="overflow-x-auto px-3 pb-4 lg:px-3">
          <Suspense>
            <AdminSidebar />
          </Suspense>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-2 border-b border-border bg-card px-4">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            사이트 보기 <ExternalLink className="size-3.5" aria-hidden />
          </Link>
          <ThemeToggle />
          <Suspense fallback={<Skeleton className="h-5 w-20" />}>
            <AdminUser />
          </Suspense>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm hover:bg-muted"
            >
              <LogOut className="size-4" aria-hidden />
              로그아웃
            </button>
          </form>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}

async function AdminUser() {
  const session = await requireAdmin();
  return <span className="text-sm font-medium">{session.displayName}님</span>;
}
