import { z } from "zod";
import { checkbox, optionalText } from "./common";

const passwordRule = z
  .string()
  .min(4, "비밀번호는 4자 이상 입력하세요.")
  .max(64, "비밀번호는 64자 이내로 입력하세요.");

/** 비어 있으면 null (비공개 해제 시 비밀번호 칸은 입력 불가 → 전송되지 않음) */
const optionalPassword = z
  .string()
  .nullish()
  .transform((v) => (v ? v : null))
  .pipe(passwordRule.nullable());

const inquiryFields = {
  title: z.string().trim().min(1, "제목을 입력하세요.").max(200),
  content: z.string().trim().min(10, "내용을 10자 이상 입력하세요.").max(5_000),
  phone: optionalText(30),
  isPrivate: checkbox,
};

export const inquirySchema = z
  .object({
    ...inquiryFields,
    authorName: z.string().trim().min(1, "이름을 입력하세요.").max(30),
    email: z.email("올바른 이메일 주소를 입력하세요.").max(200),
    /** 비공개 문의만 비밀번호 사용 */
    password: optionalPassword,
    privacyConsent: checkbox.refine(
      (v) => v,
      "개인정보 수집·이용에 동의해야 문의를 등록할 수 있습니다.",
    ),
    /** 스팸 방지용 숨김 필드 — 값이 있으면 봇으로 간주 */
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .refine((v) => !v.isPrivate || v.password, {
    message: "비공개 문의는 비밀번호를 입력해야 합니다.",
    path: ["password"],
  });

/** 작성자 본인의 문의 수정 */
export const inquiryUpdateSchema = z.object({
  ...inquiryFields,
  id: z.coerce.number().int().positive(),
  /** 본인 확인용 기존 비밀번호 (비공개 문의 또는 다른 브라우저에서 수정할 때) */
  currentPassword: z
    .string()
    .nullish()
    .transform((v) => v || null),
  /** 새 비밀번호 — 비공개로 바꾸면서 기존 비밀번호가 없을 때 필수, 그 외에는 변경할 때만 */
  newPassword: optionalPassword,
});

/** 작성자 본인의 문의 삭제 */
export const inquiryDeleteSchema = z.object({
  id: z.coerce.number().int().positive(),
  currentPassword: z
    .string()
    .nullish()
    .transform((v) => v || null),
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
