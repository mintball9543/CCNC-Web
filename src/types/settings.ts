/** 관리자에서 수정하는 사이트 설정 타입 */

export interface ContactSettings {
  /** 도로명 주소 */
  address: string;
  /** 상세 주소 (예: 충남연구원 2층) */
  addressDetail: string;
  postalCode: string;
  phone: string;
  fax: string;
  email: string;
  /** 오시는 길 — 대중교통 안내 */
  transit: string;
  /** 오시는 길 — 주차 안내 */
  parking: string;
}

export interface OrgMember {
  id: number;
  department: string;
  position: string;
  name: string;
  duties: string;
  phone: string | null;
  email: string | null;
  isHead: boolean;
  isVisible: boolean;
  sortOrder: number;
}

export interface ChartRow {
  /** 가로축 값 (예: "2024") */
  label: string;
  /** 계열별 값 (series 순서와 동일, 빈 값은 null) */
  values: (number | null)[];
}

export type ChartType = "bar" | "line" | "stacked";

export interface ChartDataset {
  id: number;
  slug: string;
  title: string;
  description: string;
  unit: string;
  chartType: ChartType;
  categoryLabel: string;
  series: string[];
  rows: ChartRow[];
  source: string;
  sourceUrl: string | null;
  isPublished: boolean;
  showOnHome: boolean;
  sortOrder: number;
}

export interface StatHighlight {
  id: number;
  label: string;
  value: number;
  unit: string;
  description: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface HeroSlide {
  id: number;
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface UploadedFile {
  id: number;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  kind: "image" | "attachment";
}
