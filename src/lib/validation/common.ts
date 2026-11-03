import { z } from "zod";
import type { ActionState } from "@/types";

/** FormData 의 체크박스 값("on") → boolean */
export const checkbox = z
  .string()
  .nullish()
  .transform((v) => v === "on" || v === "true");

/** 비어있으면 null 로 정규화되는 선택 문자열 */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max}자 이내로 입력하세요.`)
    .nullish()
    .transform((v) => (v ? v : null));

/** http(s) URL 또는 사이트 내부 경로(/로 시작) */
export const optionalLink = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\//.test(v) || /^\/(?!\/)/.test(v), {
    message: "http(s):// 로 시작하는 주소 또는 / 로 시작하는 내부 경로를 입력하세요.",
  });

/** FormData → 일반 객체 (같은 이름의 다중 값은 마지막 값 사용) */
export function formDataToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string" && !key.startsWith("$ACTION")) result[key] = value;
  });
  return result;
}

const SENSITIVE_FIELDS = ["password", "passwordConfirm"];

/** zod 검증 실패를 ActionState 로 변환 (입력값은 비밀번호를 제외하고 되돌려준다) */
export function validationError<T>(
  error: z.ZodError,
  values?: Record<string, string>,
): ActionState<T> {
  const safeValues = values
    ? Object.fromEntries(Object.entries(values).filter(([key]) => !SENSITIVE_FIELDS.includes(key)))
    : undefined;
  return {
    ok: false,
    message: "입력값을 확인해 주세요.",
    fieldErrors: z.flattenError(error).fieldErrors as ActionState["fieldErrors"],
    values: safeValues,
  };
}
