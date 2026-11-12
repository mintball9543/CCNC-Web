import type { RelatedSite } from "@/types";
import { RelatedSitesSlider } from "./related-sites-slider";

/**
 * 관련 기관 사이트 — 메인 화면 하단의 로고 카드 한 줄.
 * 넘치는 만큼은 자동으로 넘어가거나 직접 넘겨볼 수 있다 (RelatedSitesSlider).
 * 로고는 관리자 > 관련 사이트에서 교체할 수 있고, 로고가 없으면 기관명을 글자로 표시한다.
 */
export function RelatedSites({ sites }: { sites: RelatedSite[] }) {
  if (sites.length === 0) return null;
  return <RelatedSitesSlider sites={sites} />;
}
