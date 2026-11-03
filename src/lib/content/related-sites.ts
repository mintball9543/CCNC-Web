import type { NavItem } from "@/types";

/**
 * 관련 사이트 — 접속 확인된 공식 기관 누리집만 등록한다.
 * 기존 사이트의 16개 링크 중 접속 불가 사이트 정리 내역은 ISSUES.md CONTENT-010 참고.
 */
export const relatedSites: NavItem[] = [
  { title: "충청남도", href: "https://www.chungnam.go.kr", external: true },
  { title: "충남연구원", href: "https://www.cni.re.kr", external: true },
  { title: "온실가스종합정보센터", href: "https://www.gir.go.kr", external: true },
];
