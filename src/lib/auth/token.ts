/**
 * 관리자 세션 토큰(JWT, HS256) 인코딩/검증.
 * next/headers 에 의존하지 않으므로 proxy.ts 와 서버 코드 양쪽에서 사용 가능하다.
 */
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "ccnc_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8시간

export interface AdminSession {
  userId: number;
  username: string;
  displayName: string;
}

const DEV_FALLBACK_SECRET = "ccnc-dev-only-secret-do-not-use-in-production-0000";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET 환경 변수(32자 이상)가 설정되지 않았습니다.");
    }
    return new TextEncoder().encode(DEV_FALLBACK_SECRET);
  }
  return new TextEncoder().encode(secret);
}

export async function encodeSession(session: AdminSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(session.userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function decodeSession(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    if (
      typeof payload.userId !== "number" ||
      typeof payload.username !== "string" ||
      typeof payload.displayName !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      username: payload.username,
      displayName: payload.displayName,
    };
  } catch {
    return null;
  }
}
