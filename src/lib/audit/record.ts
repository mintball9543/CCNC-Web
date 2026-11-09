import "server-only";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { insertAuditLog } from "@/lib/repositories/audit.repository";
import { ipFromHeaders } from "./ip";
import { categoryOf } from "./labels";

export interface AuditEntry {
  /** 동작 코드 (예: post.update, auth.login) */
  action: string;
  /** 사람이 읽는 설명 (예: 공지사항 게시글 수정: 제목) */
  summary: string;
  /** 대상 (예: posts:12) */
  target?: string | null;
  /** 세션이 아직 없을 때(로그인 실패 등) 직접 지정 */
  adminId?: number | null;
}

/**
 * 관리자 작업 기록 — 어떤 IP 가 무엇을 변경했는지 남긴다.
 * 기록 실패가 실제 작업을 막지 않도록 오류는 로그만 남기고 무시한다.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    const h = await headers();
    const adminId =
      entry.adminId !== undefined ? entry.adminId : ((await getSession())?.userId ?? null);
    await insertAuditLog(db, {
      ip: ipFromHeaders(h),
      userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
      adminId,
      category: categoryOf(entry.action),
      action: entry.action,
      target: entry.target ?? null,
      summary: entry.summary.slice(0, 500),
      path: h.get("referer") ? safePath(h.get("referer")!) : null,
    });
  } catch (error) {
    console.error("관리자 작업 기록 실패", error);
  }
}

function safePath(url: string): string | null {
  try {
    return new URL(url).pathname.slice(0, 300);
  } catch {
    return null;
  }
}
