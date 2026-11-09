import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import { getOwnerKeyHash } from "@/lib/inquiry/owner";
import { authorActionMode } from "@/lib/inquiry/permissions";
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

/**
 * 작성자 본인 기능 (쿠키를 읽으므로 캐시하지 않음 — Suspense 안에서 호출)
 */

/** 상세 화면의 수정·삭제 버튼 표시 방식 */
export async function getInquiryAuthorMode(id: number) {
  const [auth, ownerKeyHash] = await Promise.all([
    inquiryRepository.findInquiryAuth(id),
    getOwnerKeyHash(),
  ]);
  if (!auth) return "none" as const;
  return authorActionMode(
    {
      isPrivate: auth.isPrivate,
      hasPassword: auth.passwordHash !== null,
      answered: auth.answeredAt !== null,
    },
    ownerKeyHash !== null && ownerKeyHash === auth.ownerKeyHash,
  );
}

/** 수정 화면 — 작성 브라우저의 공개 문의면 수정할 내용까지 반환 */
export async function getInquiryForAuthorEdit(id: number) {
  const mode = await getInquiryAuthorMode(id);
  if (mode !== "direct") return { mode, inquiry: null };
  const inquiry = await inquiryRepository.findInquiry(id);
  if (!inquiry) return { mode: "none" as const, inquiry: null };
  return {
    mode,
    inquiry: {
      id: inquiry.id,
      title: inquiry.title,
      content: inquiry.content,
      phone: inquiry.phone,
      isPrivate: inquiry.isPrivate,
      hasPassword: inquiry.hasPassword,
    },
  };
}

/** '본인 글 보기' — 이 브라우저에서 작성한 문의 목록 (쿠키가 없으면 null) */
export async function getMyInquiries(page = 1) {
  const ownerKeyHash = await getOwnerKeyHash();
  if (!ownerKeyHash) return null;
  return inquiryRepository.listInquiries({ page, ownerKeyHash });
}
