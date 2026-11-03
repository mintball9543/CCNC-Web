/** 온실가스 배출 통계 타입 — 공식 통계 출처(source) 필수 */
export interface EmissionRecord {
  year: number;
  /** 단위: 천 tCO2eq */
  total: number;
  /** 부문별 배출량 (선택) */
  sectors?: Record<string, number>;
}

export interface EmissionDataset {
  title: string;
  unit: string;
  /** 출처 기관·자료명 (예: 온실가스종합정보센터, 2022 지역별 온실가스 인벤토리) */
  source: string;
  /** 출처 URL */
  sourceUrl?: string;
  /** 자료 기준일/공표일 */
  publishedAt?: string;
  records: EmissionRecord[];
}
