import "server-only";
import { cookies } from "next/headers";
import {
  decodeSession,
  encodeSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  type AdminSession,
} from "./token";

export async function createSession(session: AdminSession): Promise<void> {
  const token = await encodeSession(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE)?.value);
}
