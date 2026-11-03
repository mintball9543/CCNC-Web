"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { findAdminByUsername, touchAdminLogin } from "@/lib/repositories/admin-user.repository";
import { formDataToObject, validationError } from "@/lib/validation/common";
import { loginSchema } from "@/lib/validation/auth.schema";
import type { ActionState } from "@/types";

/** 계정이 없을 때도 응답 시간이 같도록 비교에 사용하는 더미 해시 (최초 1회 생성) */
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword("ccnc-dummy-password"));

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formDataToObject(formData);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);

  const { username, password, next } = parsed.data;
  const user = await findAdminByUsername(username);
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));

  if (!user || !valid) {
    return {
      ok: false,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      values: { username, next: next ?? "" },
    };
  }

  await createSession({ userId: user.id, username: user.username, displayName: user.displayName });
  await touchAdminLogin(user.id);

  const safeNext = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  redirect(safeNext);
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/admin/login");
}
