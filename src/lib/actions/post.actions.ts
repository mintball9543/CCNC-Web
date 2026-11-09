"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit/record";
import { requireAdmin } from "@/lib/auth/guard";
import { cacheTags } from "@/lib/cache/tags";
import { boards } from "@/lib/config/boards";
import { extractFirstImage, sanitizePostHtml } from "@/lib/content/sanitize";
import * as fileRepository from "@/lib/repositories/file.repository";
import * as postRepository from "@/lib/repositories/post.repository";
import * as settingsRepository from "@/lib/repositories/settings.repository";
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
  const board = boards[input.boardKey];
  if (board.categories && !board.categories.some((c) => c.key === input.category)) {
    return {
      ok: false,
      message: "분류를 선택하세요.",
      fieldErrors: { category: ["분류를 선택하세요."] },
      values: raw,
    };
  }
  const { attachmentIds, featureOnHero, ...fields } = input;
  const content = sanitizePostHtml(fields.content);
  const attachments = await fileRepository.listFilesByIds(attachmentIds);
  const firstImageAttachment = attachmentIds
    .map((aid) => attachments.find((a) => a.id === aid))
    .find((a) => a?.mimeType.startsWith("image/"));
  const thumbnailUrl =
    extractFirstImage(content) ?? (firstImageAttachment ? fileUrl(firstImageAttachment.id) : null);

  const isGallery = input.boardKey === "gallery";
  if (isGallery && featureOnHero && !thumbnailUrl) {
    return {
      ok: false,
      message: "메인 비주얼에 표시하려면 본문에 사진을 1장 이상 넣으세요.",
      fieldErrors: { featureOnHero: ["본문에 사진이 없습니다."] },
      values: raw,
    };
  }

  const values = {
    ...fields,
    content,
    format: "html" as const,
    category: board.categories ? fields.category : null,
    thumbnailUrl,
  };

  const existingId = raw.id ? Number(raw.id) : null;
  let id: number;
  if (existingId) {
    id = existingId;
    await postRepository.updatePost(id, values);
  } else {
    id = await postRepository.insertPost(values);
  }
  await fileRepository.syncPostAttachments(id, attachmentIds);

  // 활동 갤러리 ↔ 메인 비주얼 연동
  if (isGallery) {
    if (featureOnHero && thumbnailUrl) {
      await settingsRepository.upsertHeroSlideForPost(id, {
        imageUrl: thumbnailUrl,
        imageAlt: values.title,
        title: values.title,
        linkUrl: `/news/gallery/${id}`,
        isActive: values.isPublished,
      });
    } else {
      await settingsRepository.deleteHeroSlidesByPostIds([id]);
    }
    updateTag(cacheTags.heroSlides);
  }

  await recordAudit({
    action: existingId ? "post.update" : "post.create",
    target: `posts:${id}`,
    summary: `${board.title} 게시글 ${existingId ? "수정" : "등록"}: ${values.title}${
      isGallery && featureOnHero ? " (메인 비주얼 표시)" : ""
    }`,
  });
  updateTag(cacheTags.post(id));
  updateTag(cacheTags.posts(input.boardKey));
  redirect(`/admin/boards/${input.boardKey}`);
}

async function removePosts(boardKey: BoardKey, ids: number[]) {
  for (const id of ids) {
    await fileRepository.deletePostAttachments(id);
    await postRepository.deletePost(id);
    updateTag(cacheTags.post(id));
  }
  // FK 동작에 의존하지 않고 연동 슬라이드를 직접 정리
  if ((await settingsRepository.deleteHeroSlidesByPostIds(ids)) > 0)
    updateTag(cacheTags.heroSlides);
  updateTag(cacheTags.posts(boardKey));
}

export async function deletePostAction(boardKey: BoardKey, id: number): Promise<void> {
  await requireAdmin();
  const [post] = await postRepository.findPostsByIds(boardKey, [id]);
  if (post) {
    await removePosts(boardKey, [id]);
    await recordAudit({
      action: "post.delete",
      target: `posts:${id}`,
      summary: `${boards[boardKey].title} 게시글 삭제: ${post.title}`,
    });
  }
  redirect(`/admin/boards/${boardKey}`);
}

/** 선택 삭제 — 체크한 게시글(name="ids")을 한 번에 삭제 */
export async function bulkDeletePostsAction(boardKey: BoardKey, formData: FormData): Promise<void> {
  await requireAdmin();
  const ids = parseIds(formData);
  const targets = await postRepository.findPostsByIds(boardKey, ids);
  if (targets.length > 0) {
    await removePosts(
      boardKey,
      targets.map((t) => t.id),
    );
    await recordAudit({
      action: "post.bulk_delete",
      target: targets
        .map((t) => `posts:${t.id}`)
        .join(",")
        .slice(0, 300),
      summary: `${boards[boardKey].title} 게시글 ${targets.length}건 선택 삭제: ${targets
        .map((t) => t.title)
        .join(", ")}`,
    });
  }
  redirect(`/admin/boards/${boardKey}`);
}

function parseIds(formData: FormData): number[] {
  return [
    ...new Set(
      formData
        .getAll("ids")
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0),
    ),
  ];
}
