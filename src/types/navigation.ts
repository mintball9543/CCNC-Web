/** 사이트 메뉴(GNB/LNB/브레드크럼) 정의 타입 — 단일 출처: src/lib/config/navigation.ts */
export interface NavItem {
  /** 메뉴명 (페이지 제목과 동일하게 유지 — 위치표시 불일치 방지) */
  title: string;
  href: string;
  /** 외부 링크 여부 */
  external?: boolean;
}

export interface NavSection {
  /** 대메뉴 식별자 (URL 1단계 세그먼트와 동일) */
  key: string;
  title: string;
  /** 대메뉴 소개 문구 (서브 비주얼에 사용) */
  description: string;
  href: string;
  items: NavItem[];
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}
