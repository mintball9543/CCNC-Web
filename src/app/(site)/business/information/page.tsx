import { BusinessPlanPage } from "@/components/content/plan-project";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/business/information");

/** 주요사업 — 운영 전략(분야)별 2026년 사업 (src/lib/content/center-plan.ts) */
export default function Page() {
  return <BusinessPlanPage field="information" />;
}
