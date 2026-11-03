import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import type { AdminSession } from "./token";

/**
 * 관리자 인증 확인 (Data Access Layer).
 * proxy.ts 의 낙관적 검사와 별개로, 모든 관리자 페이지·Server Action 에서 반드시 호출한다.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
