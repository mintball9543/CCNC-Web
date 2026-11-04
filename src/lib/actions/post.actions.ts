"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { cacheTags } from "@/lib/cache/tags";
import { boards } from "@/lib/config/boards";
import { extractFirstImage, sanitizePostHtml } from "@/lib/content/sanitize";
import * as fileRepository from "@/lib/repositories/file.repository";
import * as postRepository from "@/lib/repositories/post.repository";
import { fileUrl } from "@/lib/uploads/url";
import { formDataToObject, validationError } from "@/lib/validation/common";
import { postSchema } from "@/lib/validation/post.schema";
import type { ActionState, BoardKey } from "@/types";

/** 게시글 생성/수정 — hidden 필드 id 가 있으면 수정 */
export async function savePostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = formDataToObject(formData);
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error, raw);

  const input = parsed.data;
  const categories = boards[input.boardKey].categories;
  if (categories && !categories.some((c) => c.key === input.category)) {
    return {
      ok: false,
      message: "분류를 선택하세요.",
      fieldErrors: { category: ["분류를 선택하세요."] },
      values: raw,
    };
  }
  const { attachmentIds, ...fields } = input;
  const content = sanitizePostHtml(fields.content);
  const attachments = await fileRepository.listFilesByIds(attachmentIds);
  const firstImageAttachment = attachmentIds
    .map((aid) => attachments.find((a) => a.id === aid))
    .find((a) => a?.mimeType.startsWith("image/"));
  const values = {
    ...fields,
    content,
    format: "html" as const,
    category: categories ? fields.category : null,
    thumbnailUrl:
      extractFirstImage(content) ??
      (firstImageAttachment ? fileUrl(firstImageAttachment.id) : null),
  };

  let id = raw.id ? Number(raw.id) : null;
  if (id) {
    await postRepository.updatePost(id, values);
  } else {
    id = await postRepository.insertPost(values);
  }
  await fileRepository.syncPostAttachments(id, attachmentIds);
  updateTag(cacheTags.post(id));
  updateTag(cacheTags.posts(input.boardKey));
  redirect(`/admin/boards/${input.boardKey}`);
}

export async function deletePostAction(boardKey: BoardKey, id: number): Promise<void> {
  await requireAdmin();
  await fileRepository.deletePostAttachments(id);
  await postRepository.deletePost(id);
  updateTag(cacheTags.posts(boardKey));
  updateTag(cacheTags.post(id));
  redirect(`/admin/boards/${boardKey}`);
}
