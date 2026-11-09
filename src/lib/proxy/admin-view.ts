/**
 * 관리자 페이지 접속 기록 (proxy 전용).
 * 실제 페이지 열람(직접 접속·메뉴 이동)만 기록하고, 링크 미리 불러오기(prefetch)는 제외한다.
 */
import type { NextRequest } from "next/server";
import { ipFromHeaders } from "@/lib/audit/ip";
import { insertAuditLog } from "@/lib/repositories/audit.repository";
import { getProxyDb } from "./db";

export function isPrefetchRequest(headers: Pick<Headers, "get" | "has">): boolean {
  return (
    headers.has("next-router-prefetch") ||
    headers.has("next-router-segment-prefetch") ||
    /prefetch/i.test(headers.get("purpose") ?? "") ||
    /prefetch/i.test(headers.get("sec-purpose") ?? "")
  );
}

export async function logAdminView(request: NextRequest, adminId: number | null): Promise<void> {
  if (request.method !== "GET" || isPrefetchRequest(request.headers)) return;
  const { pathname, search } = request.nextUrl;
  try {
    await insertAuditLog(getProxyDb(), {
      ip: ipFromHeaders(request.headers),
      userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
      adminId,
      category: "view",
      action: adminId ? "view.page" : "view.anonymous",
      target: null,
      summary: adminId ? "관리자 페이지 열람" : "관리자 페이지 접근 (로그인 전)",
      path: `${pathname}${search}`.slice(0, 300),
    });
  } catch (error) {
    console.error("관리자 접속 기록 실패", error);
  }
}
