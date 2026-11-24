import { createHash } from "node:crypto";
import { ipFromHeaders } from "@/lib/audit/ip";

/**
 * 접속자 구분용 해시 — IP·브라우저 정보를 그날의 비밀 값과 섞는다.
 * IP 자체는 저장하지 않고, 날짜가 바뀌면 같은 사람도 다른 값이 된다. (방문자 통계·게시글 조회수)
 */
export function visitorHash(headers: Headers, day: string, secret = process.env.AUTH_SECRET ?? "") {
  const userAgent = headers.get("user-agent") ?? "";
  return createHash("sha256")
    .update(`${secret}|${day}|${ipFromHeaders(headers)}|${userAgent}`)
    .digest("base64url")
    .slice(0, 32);
}

/** 집계 대상이 아닌 요청 — 다른 사이트에서 보낸 요청 */
export function isCrossSiteRequest(headers: Headers): boolean {
  const site = headers.get("sec-fetch-site");
  return !!site && site !== "same-origin";
}
