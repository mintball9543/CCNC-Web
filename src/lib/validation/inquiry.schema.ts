import { z } from "zod";
import { checkbox, optionalText } from "./common";

export const inquirySchema = z.object({
  title: z.string().trim().min(1, "제목을 입력하세요.").max(200),
  content: z.string().trim().min(10, "내용을 10자 이상 입력하세요.").max(5_000),
  authorName: z.string().trim().min(1, "이름을 입력하세요.").max(30),
  email: z.email("올바른 이메일 주소를 입력하세요.").max(200),
  phone: optionalText(30),
  password: z
    .string()
    .min(4, "비밀번호는 4자 이상 입력하세요.")
    .max(64, "비밀번호는 64자 이내로 입력하세요."),
  isPrivate: checkbox,
  privacyConsent: checkbox.refine(
    (v) => v,
    "개인정보 수집·이용에 동의해야 문의를 등록할 수 있습니다.",
  ),
  /** 스팸 방지용 숨김 필드 — 값이 있으면 봇으로 간주 */
  website: z.string().max(0).optional().or(z.literal("")),
});

export const inquiryPasswordSchema = z.object({
  id: z.coerce.number().int().positive(),
  password: z.string().min(1, "비밀번호를 입력하세요."),
});

export const inquiryAnswerSchema = z.object({
  id: z.coerce.number().int().positive(),
  answer: z.string().trim().min(1, "답변 내용을 입력하세요.").max(10_000),
  /** 작성자에게 답변 알림 메일 발송 */
  notify: checkbox,
});

export type InquiryInput = z.infer<typeof inquirySchema>;
