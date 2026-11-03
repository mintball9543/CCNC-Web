import { cacheLife } from "next/cache";

/** 저작권 연도 — 하루 단위로 캐시 (Cache Components 에서 new Date() 직접 사용 불가) */
export async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
