import { z } from "zod";

/** 관리자 로그인 — 단일 관리자 구조이므로 비밀번호만 입력 */
export const loginSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력하세요.").max(200),
  next: z.string().optional(),
});
