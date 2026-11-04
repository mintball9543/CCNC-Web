import type { ContactSettings } from "@/types";

/**
 * 기관 기본 정보 — 푸터·오시는 길·메타데이터에서 공통 사용.
 *
 * ⚠️ 운영 주체는 '충청남도 탄소중립지원센터'이며, 충남연구원 건물(2층)에 위치하나 독립 기관이다.
 *    모든 표기는 센터 명의로 유지한다. (ISSUES.md CONTENT-001 참고)
 */
export const siteConfig = {
  name: "충청남도 탄소중립지원센터",
  shortName: "충남탄소중립지원센터",
  englishName: "Chungnam Carbon Neutrality Center",
  abbreviation: "CCNC",
  description:
    "충청남도 탄소중립지원센터는 「기후위기 대응을 위한 탄소중립·녹색성장 기본법」에 따라 지역의 탄소중립 정책 수립과 이행을 지원합니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "ko_KR",
  /**
   * 연락처 기본값 — 실제 값은 관리자 > 기관 정보에서 입력한다(DB 우선).
   * 운영 주체는 센터이므로 개인 메일·타 기관 주소를 쓰지 않는다. (ISSUES.md CONTENT-002)
   */
  contactDefaults: {
    address: "",
    addressDetail: "충남연구원 2층",
    postalCode: "",
    phone: "",
    fax: "",
    email: "",
    transit: "",
    parking: "",
  } satisfies ContactSettings,

  copyrightHolder: "충청남도 탄소중립지원센터",
} as const;

export type SiteConfig = typeof siteConfig;
