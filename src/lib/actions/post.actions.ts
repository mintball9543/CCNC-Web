"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { cacheTags } from "@/lib/cache/tags";
import { boards } from "@/lib/config/boards";
import * as postRepository from "@/lib/repositories/post.repository";
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
  const values = { ...input, category: categories ? input.category : null };

  const id = raw.id ? Number(raw.id) : null;
  if (id) {
    await postRepository.updatePost(id, values);
    updateTag(cacheTags.post(id));
  } else {
    await postRepository.insertPost(values);
  }
  updateTag(cacheTags.posts(input.boardKey));
  redirect(`/admin/boards/${input.boardKey}`);
}

export async function deletePostAction(boardKey: BoardKey, id: number): Promise<void> {
  await requireAdmin();
  await postRepository.deletePost(id);
  updateTag(cacheTags.posts(boardKey));
  updateTag(cacheTags.post(id));
  redirect(`/admin/boards/${boardKey}`);
}
