import { z } from "zod";
import { POPUP_POSITIONS } from "@/types";
import { fromDateTimeLocalValue } from "@/lib/utils/format";
import { checkbox, optionalLink, optionalText } from "./common";

const px = (label: string, min: number, max: number) =>
  z.coerce
    .number({ error: `${label}을(를) 숫자로 입력하세요.` })
    .int(`${label}은(는) 정수여야 합니다.`)
    .min(min, `${label}은(는) ${min} 이상이어야 합니다.`)
    .max(max, `${label}은(는) ${max} 이하이어야 합니다.`);

const optionalDate = z
  .string()
  .nullish()
  .transform((v) => fromDateTimeLocalValue(v));

export const popupSchema = z
  .object({
    title: z.string().trim().min(1, "관리용 제목을 입력하세요.").max(100),
    content: z.string().trim().max(5_000).default(""),
    imageUrl: optionalLink,
    imageAlt: optionalText(200),
    linkUrl: optionalLink,
    position: z.enum(POPUP_POSITIONS),
    left: px("좌측 좌표", 0, 4000),
    top: px("상단 좌표", 0, 4000),
    width: px("너비", 200, 1600),
    height: z
      .string()
      .trim()
      .nullish()
      .transform((v) => (v ? Number(v) : null))
      .refine((v) => v === null || (Number.isInteger(v) && v >= 100 && v <= 1600), {
        message: "높이는 100~1600 사이 정수이거나 비워두세요(자동).",
      }),
    isActive: checkbox,
    startsAt: optionalDate,
    endsAt: optionalDate,
    sortOrder: px("정렬 순서", 0, 999),
  })
  .refine((v) => v.content.length > 0 || v.imageUrl !== null, {
    message: "내용 또는 이미지 중 하나는 입력해야 합니다.",
    path: ["content"],
  })
  .refine((v) => !v.imageUrl || v.imageAlt, {
    message: "이미지를 사용하는 경우 대체 텍스트를 입력하세요. (웹 접근성)",
    path: ["imageAlt"],
  })
  .refine((v) => !v.startsAt || !v.endsAt || v.startsAt < v.endsAt, {
    message: "종료 일시는 시작 일시 이후여야 합니다.",
    path: ["endsAt"],
  });

export type PopupInput = z.infer<typeof popupSchema>;
