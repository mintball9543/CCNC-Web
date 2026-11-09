"use server";

import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit/record";
import { getClientIp } from "@/lib/auth/client-ip";
import { verifyPassword } from "@/lib/auth/password";
import { getLimiter } from "@/lib/auth/rate-limit";
import { createSession, deleteSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { findPrimaryAdmin, touchAdminLogin } from "@/lib/repositories/admin-user.repository";
import { pruneAuditLogs } from "@/lib/repositories/audit.repository";
import { formDataToObject, validationError } from "@/lib/validation/common";
import { loginSchema } from "@/lib/validation/auth.schema";
import type { ActionState } from "@/types";

/** 작업 기록 보존 기간 (ISSUES.md TECH-013) */
const AUDIT_RETENTION_DAYS = 365;

/** IP 당 15분에 5회 실패 시 잠금 */
const loginLimiter = () => getLimiter("admin-login", 5, 15 * 60 * 1000);

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formDataToObject(formData);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);

  const ip = await getClientIp();
  const blocked = loginLimiter().blockedFor(ip);
  if (blocked > 0) {
    await recordAudit({
      action: "auth.login_blocked",
      adminId: null,
      summary: "관리자 로그인 차단 (시도 횟수 초과)",
    });
    return {
      ok: false,
      message: `로그인 시도가 너무 많습니다. ${Math.ceil(blocked / 60000)}분 후 다시 시도하세요.`,
      values: { next: raw.next ?? "" },
    };
  }

  const admin = await findPrimaryAdmin();
  const valid = admin ? await verifyPassword(parsed.data.password, admin.passwordHash) : false;
  if (!admin || !valid) {
    loginLimiter().fail(ip);
    await recordAudit({
      action: "auth.login_failed",
      adminId: null,
      summary: "관리자 로그인 실패 (비밀번호 불일치)",
    });
    return {
      ok: false,
      message: "비밀번호가 올바르지 않습니다.",
      values: { next: raw.next ?? "" },
    };
  }

  loginLimiter().reset(ip);
  await createSession({
    userId: admin.id,
    username: admin.username,
    displayName: admin.displayName,
  });
  await touchAdminLogin(admin.id);
  await recordAudit({ action: "auth.login", adminId: admin.id, summary: "관리자 로그인" });
  await pruneAuditLogs(db, new Date(Date.now() - AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000)).catch(
    () => {},
  );

  const next = parsed.data.next;
  redirect(next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction(): Promise<void> {
  await recordAudit({ action: "auth.logout", summary: "관리자 로그아웃" });
  await deleteSession();
  redirect("/admin/login");
}
