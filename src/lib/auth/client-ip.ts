import "server-only";
import { headers } from "next/headers";
import { ipFromHeaders } from "@/lib/audit/ip";

/** 요청 IP (리버스 프록시 뒤에서는 X-Forwarded-For 첫 값) */
export async function getClientIp(): Promise<string> {
  return ipFromHeaders(await headers());
}
