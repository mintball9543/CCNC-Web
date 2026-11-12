/**
 * 네이버 지도(NAVER Cloud Platform Maps) 설정 해석 (순수 함수 — 앱과 `npm run env:check` 공용).
 * 환경 변수
 * - NAVER_MAP_CLIENT_ID : Maps Application 의 Client ID (필수 — 없으면 지도 대신 '네이버 지도에서 보기' 링크만 표시)
 * - NAVER_MAP_LAT / NAVER_MAP_LNG : 표시 위치 좌표 (선택 — 없으면 기관 주소로 위치를 찾음)
 */
export interface NaverMapConfig {
  clientId: string;
  /** 좌표를 직접 지정한 경우 (주소 검색 생략) */
  center: { lat: number; lng: number } | null;
}

export const NAVER_MAP_SCRIPT_URL = "https://oapi.map.naver.com/openapi/v3/maps.js";

export function resolveNaverMapConfig(
  env: Record<string, string | undefined>,
): NaverMapConfig | null {
  const clientId = env.NAVER_MAP_CLIENT_ID?.trim();
  if (!clientId) return null;
  const lat = Number(env.NAVER_MAP_LAT?.trim() || NaN);
  const lng = Number(env.NAVER_MAP_LNG?.trim() || NaN);
  const valid =
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  return { clientId, center: valid ? { lat, lng } : null };
}

/** 지도 스크립트 주소 — 주소로 위치를 찾을 때는 geocoder 서브모듈을 함께 불러온다 */
export function naverMapScriptSrc(config: NaverMapConfig): string {
  const params = new URLSearchParams({ ncpKeyId: config.clientId });
  if (!config.center) params.set("submodules", "geocoder");
  return `${NAVER_MAP_SCRIPT_URL}?${params}`;
}

/** 네이버 지도 웹에서 주소 검색 결과로 여는 링크 (API 키 없이도 동작) */
export function naverMapSearchUrl(query: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}
