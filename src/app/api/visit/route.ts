import { createHash } from "node:crypto";
import { ipFromHeaders } from "@/lib/audit/ip";
import { recordVisit } from "@/lib/repositories/visit.repository";
import { isBotUserAgent, kstDay } from "@/lib/visits/stats";

const noContent = () => new Response(null, { status: 204 });

/**
 * 공개 페이지 열람 집계 (사이트의 VisitTracker 가 페이지를 열 때마다 호출).
 * - 다른 사이트에서 보낸 요청·검색엔진 등은 제외
 * - 접속자 구분은 IP·브라우저 정보를 그날의 비밀 값과 섞은 해시로만 하고, IP 자체는 저장하지 않는다
 */
export async function POST(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return noContent();
  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBotUserAgent(userAgent)) return noContent();

  const day = kstDay(new Date());
  const hash = createHash("sha256")
    .update(
      `${process.env.AUTH_SECRET ?? ""}|${day}|${ipFromHeaders(request.headers)}|${userAgent}`,
    )
    .digest("base64url")
    .slice(0, 32);
  try {
    await recordVisit(day, hash);
  } catch (error) {
    console.error("방문 집계 실패", error);
  }
  return noContent();
}
