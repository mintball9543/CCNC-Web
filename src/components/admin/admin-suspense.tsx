import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/feedback";

/**
 * 관리자 페이지 본문 경계.
 * 관리자 화면은 세션(cookies)과 최신 DB 데이터를 읽으므로, 각 페이지가 자기 Suspense 경계를 가져야
 * 메뉴 간 이동 시 화면이 막히지 않는다. (Cache Components 즉시 탐색 검증 — blocking-route 오류 방지)
 */
export function AdminSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3" aria-busy="true" aria-label="불러오는 중">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
