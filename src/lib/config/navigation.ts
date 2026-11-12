import type { BreadcrumbItem, NavItem, NavSection } from "@/types";

/**
 * 사이트 메뉴 구조 — 「홈페이지 개편 검토」 3. 메뉴 개편안 기준.
 *
 * GNB, 모바일 메뉴, 서브 페이지 좌측 메뉴(LNB), 브레드크럼, 페이지 제목, sitemap.xml 이
 * 모두 이 설정 하나에서 파생된다. 메뉴명 = 페이지 제목 = 위치표시 를 보장하기 위함.
 */
export const mainNavigation: NavSection[] = [
  {
    key: "about",
    title: "센터소개",
    description: "충청남도 탄소중립지원센터를 소개합니다.",
    href: "/about/greeting",
    items: [
      { title: "인사말", href: "/about/greeting" },
      { title: "설립근거·연혁", href: "/about/history" },
      { title: "비전·목표", href: "/about/vision" },
      { title: "조직·업무", href: "/about/organization" },
      { title: "오시는 길", href: "/about/location" },
    ],
  },
  {
    key: "business",
    title: "주요사업",
    description: "지역 탄소중립 정책 이행을 위한 센터의 주요 사업입니다.",
    href: "/business/policy",
    items: [
      { title: "정책지원", href: "/business/policy" },
      { title: "조사연구", href: "/business/research" },
      { title: "교육·홍보", href: "/business/education" },
      { title: "네트워크·거버넌스", href: "/business/network" },
    ],
  },
  {
    key: "participation",
    title: "참여·실천",
    description: "도민과 함께하는 탄소중립 실천 프로그램입니다.",
    href: "/participation/practice-group",
    items: [
      { title: "탄소중립 생활실천단", href: "/participation/practice-group" },
      { title: "탄소업슈", href: "/participation/upsyu" },
      { title: "탄소발자국 계산기", href: "/participation/footprint" },
      { title: "교육 강사단", href: "/participation/instructors" },
    ],
  },
  {
    key: "carbon-neutral",
    title: "충남 탄소중립",
    description: "탄소중립의 이해와 충청남도 2045 탄소중립 계획을 안내합니다.",
    href: "/carbon-neutral/understanding",
    items: [
      { title: "탄소중립 이해", href: "/carbon-neutral/understanding" },
      { title: "충남 2045 비전·목표", href: "/carbon-neutral/vision-2045" },
      { title: "배출현황", href: "/carbon-neutral/emissions" },
      { title: "부문별 감축목표", href: "/carbon-neutral/sector-targets" },
    ],
  },
  {
    key: "news",
    title: "알림마당",
    description: "센터의 새로운 소식과 자료를 전해드립니다.",
    href: "/news/notice",
    items: [
      { title: "공지사항", href: "/news/notice" },
      { title: "센터소식", href: "/news/center-news" },
      { title: "활동 갤러리", href: "/news/gallery" },
      { title: "보도자료", href: "/news/press" },
      { title: "자료실", href: "/news/archive" },
      { title: "문의하기", href: "/news/inquiry" },
    ],
  },
];

export const footerLinks: NavItem[] = [
  { title: "개인정보처리방침", href: "/privacy" },
  { title: "사이트맵", href: "/sitemap" },
];

/** 경로가 속한 대메뉴 */
export function findSection(pathname: string): NavSection | undefined {
  const segment = pathname.split("/")[1];
  return mainNavigation.find((section) => section.key === segment);
}

/** 경로와 일치하는(또는 하위 경로인) 메뉴 항목 */
export function findNavItem(pathname: string): NavItem | undefined {
  const section = findSection(pathname);
  if (!section) return undefined;
  return section.items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

/** 홈 > 대메뉴 > 메뉴 형태의 위치표시 */
export function buildBreadcrumb(pathname: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ title: "홈", href: "/" }];
  const section = findSection(pathname);
  if (!section) return crumbs;
  crumbs.push({ title: section.title, href: section.href });
  const item = findNavItem(pathname);
  if (item) crumbs.push({ title: item.title, href: item.href });
  return crumbs;
}
