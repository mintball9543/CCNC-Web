import { z } from "zod";
import { BOARD_KEYS } from "@/types";
import { fromDateTimeLocalValue } from "@/lib/utils/format";
import { checkbox, optionalText } from "./common";

export const postSchema = z.object({
  boardKey: z.enum(BOARD_KEYS),
  category: optionalText(50),
  title: z.string().trim().min(1, "제목을 입력하세요.").max(200, "제목은 200자 이내로 입력하세요."),
  content: z.string().trim().min(1, "내용을 입력하세요.").max(50_000),
  author: z.string().trim().min(1, "작성자를 입력하세요.").max(50),
  isPinned: checkbox,
  isPublished: checkbox,
  publishedAt: z
    .string()
    .nullish()
    .transform((v) => fromDateTimeLocalValue(v) ?? new Date()),
});

export type PostInput = z.infer<typeof postSchema>;
