import type { Metadata } from "next";
import { ContentPlaceholder } from "@/components/content/content-placeholder";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return (
    <Container className="py-12">
      <h1 className="mb-8 text-3xl font-bold">개인정보처리방침</h1>
      <ContentPlaceholder
        issue="CONTENT-011"
        sections={[
          "개인정보의 처리 목적",
          "처리하는 개인정보 항목 및 보유 기간",
          "개인정보의 파기 절차 및 방법",
          "개인정보 처리 위탁",
          "정보주체의 권리·의무 및 행사 방법",
          "개인정보 보호책임자",
          "개인정보 안전성 확보 조치",
          "시행일",
        ]}
        note="「개인정보 보호법」 제30조 법정 기재사항을 모두 포함하여 재작성합니다."
      />
    </Container>
  );
}
