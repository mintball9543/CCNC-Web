import "server-only";
import { headers } from "next/headers";

/** 요청 IP (리버스 프록시 뒤에서는 X-Forwarded-For 첫 값) */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}
