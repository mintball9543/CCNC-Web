/**
 * 요청 IP 추출 (순수 함수 — proxy 와 서버 코드 공용).
 *
 * 리버스 프록시(Nginx 등) 뒤에서는 X-Forwarded-For 의 첫 값이 실제 접속자 IP 다.
 * ⚠️ 프록시 없이 서버를 직접 노출하면 이 헤더는 접속자가 임의로 꾸밀 수 있으므로,
 *    운영 시 프록시가 X-Forwarded-For 를 덮어쓰도록 설정해야 한다. (ISSUES.md TECH-012)
 */
export function ipFromHeaders(headers: Pick<Headers, "get">): string {
  const raw =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "";
  return normalizeIp(raw) || "unknown";
}

/** IPv4-mapped IPv6(::ffff:1.2.3.4) → 1.2.3.4, 루프백 ::1 → 127.0.0.1 */
export function normalizeIp(ip: string): string {
  const value = ip.trim();
  if (value === "::1") return "127.0.0.1";
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(value);
  return (mapped ? mapped[1] : value).slice(0, 64);
}
