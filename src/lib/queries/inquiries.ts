import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import * as inquiryRepository from "@/lib/repositories/inquiry.repository";

/** 공개 문의 목록 (작성자 마스킹, 본문 제외) */
export async function getPublicInquiries(page = 1) {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.inquiries);
  return inquiryRepository.listInquiries({ page });
}

/** 공개 문의 상세 (비공개 글은 본문/답변 제외) */
export async function getPublicInquiry(id: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.inquiries, cacheTags.inquiry(id));
  return inquiryRepository.findPublicInquiry(id);
}
