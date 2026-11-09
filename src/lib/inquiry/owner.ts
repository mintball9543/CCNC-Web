import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

/**
 * 문의 작성자 브라우저 식별 쿠키.
 * 쿠키에는 무작위 값만 저장하고, DB 에는 그 SHA-256 해시만 저장한다.
 */
export const INQUIRY_OWNER_COOKIE = "ccnc_inquiry_owner";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 2; // 2년

export function hashOwnerKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** 이 브라우저의 작성자 키 해시 (쿠키가 없으면 null) */
export async function getOwnerKeyHash(): Promise<string | null> {
  const key = (await cookies()).get(INQUIRY_OWNER_COOKIE)?.value;
  return key && key.length >= 32 ? hashOwnerKey(key) : null;
}

/** 작성자 키 해시 — 쿠키가 없으면 새로 발급 (Server Action 에서만 호출) */
export async function ensureOwnerKeyHash(): Promise<string> {
  const store = await cookies();
  let key = store.get(INQUIRY_OWNER_COOKIE)?.value;
  if (!key || key.length < 32) {
    key = randomBytes(32).toString("base64url");
  }
  // 사용할 때마다 만료일 연장
  store.set(INQUIRY_OWNER_COOKIE, key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return hashOwnerKey(key);
}
