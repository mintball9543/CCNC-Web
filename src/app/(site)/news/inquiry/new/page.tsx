import type { Metadata } from "next";
import { InquiryForm } from "@/components/inquiry/inquiry-form";

export const metadata: Metadata = { title: "문의 작성" };

export default function NewInquiryPage() {
  return <InquiryForm />;
}
