import type { EmissionDataset } from "@/types";

/**
 * 충청남도 온실가스 배출 현황.
 *
 * ⚠️ 공식 기관 배포 자료(온실가스종합정보센터 「지역별 온실가스 인벤토리」 등)의 수치만 입력한다.
 *    값을 추정하거나 2차 출처에서 옮기지 않는다. 매년 공표 후 records 배열에 연도만 추가하면
 *    표와 차트가 자동으로 갱신된다. (ISSUES.md CONTENT-004)
 */
export const chungnamEmissions: EmissionDataset = {
  title: "충청남도 연도별 온실가스 배출량",
  unit: "천 tCO₂eq",
  source: "온실가스종합정보센터, 지역별 온실가스 인벤토리 (입력 예정)",
  sourceUrl: "https://www.gir.go.kr",
  records: [],
};
