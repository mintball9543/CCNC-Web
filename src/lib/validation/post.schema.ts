import { z } from "zod";
import { BOARD_KEYS } from "@/types";
import { fromDateTimeLocalValue } from "@/lib/utils/format";
import { isEmptyHtml } from "@/lib/content/sanitize";
import { checkbox, optionalText } from "./common";

export const postSchema = z.object({
  boardKey: z.enum(BOARD_KEYS),
  category: optionalText(50),
  title: z.string().trim().min(1, "제목을 입력하세요.").max(200, "제목은 200자 이내로 입력하세요."),
  /** 편집기 HTML (서버에서 살균 후 저장) */
  content: z
    .string()
    .max(200_000, "내용이 너무 깁니다.")
    .refine((v) => !isEmptyHtml(v), "내용을 입력하세요."),
  author: z.string().trim().min(1, "작성자를 입력하세요.").max(50),
  isPinned: checkbox,
  isPublished: checkbox,
  publishedAt: z
    .string()
    .nullish()
    .transform((v) => fromDateTimeLocalValue(v) ?? new Date()),
  /** 첨부파일 id 목록 (쉼표 구분, 표시 순서) */
  attachmentIds: z
    .string()
    .nullish()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0),
    ),
});

export type PostInput = z.infer<typeof postSchema>;
