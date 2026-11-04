"use client";

import { useActionState, useRef } from "react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { savePostAction } from "@/lib/actions/post.actions";
import { toDateTimeLocalValue } from "@/lib/utils/format";
import { initialActionState, type BoardDefinition, type Post, type UploadedFile } from "@/types";
import { AttachmentManager, type AttachmentManagerHandle } from "./attachment-manager";

/** 기존 일반 텍스트 글을 편집기용 HTML 로 변환 */
function textToHtml(text: string) {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${escape(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** 게시글 작성/수정 폼 — 본문 편집기(이미지 포함) + 첨부파일 칸 */
export function PostForm({
  board,
  post,
  attachments = [],
  defaultAuthor,
}: {
  board: BoardDefinition;
  post?: Post;
  attachments?: UploadedFile[];
  defaultAuthor: string;
}) {
  const [state, action] = useActionState(savePostAction, initialActionState);
  const attachmentRef = useRef<AttachmentManagerHandle>(null);
  const err = (name: string) => state.fieldErrors?.[name];
  const v = state.values;
  const checked = (name: "isPinned" | "isPublished", fallback: boolean) =>
    v ? v[name] === "on" : fallback;
  const initialContent =
    v?.content ?? (post ? (post.format === "html" ? post.content : textToHtml(post.content)) : "");

  return (
    <form action={action} className="max-w-4xl space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="boardKey" value={board.key} />
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      {board.categories && (
        <Field label="분류" htmlFor="category" required errors={err("category")}>
          <Select id="category" name="category" defaultValue={v?.category ?? post?.category ?? ""}>
            <option value="">선택하세요</option>
            {board.categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="제목" htmlFor="title" required errors={err("title")}>
        <Input id="title" name="title" defaultValue={v?.title ?? post?.title} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="작성자" htmlFor="author" required errors={err("author")}>
          <Input
            id="author"
            name="author"
            defaultValue={v?.author ?? post?.author ?? defaultAuthor}
            required
          />
        </Field>
        <Field label="게시일" htmlFor="publishedAt" hint="비워두면 현재 시각으로 저장됩니다.">
          <Input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={v?.publishedAt ?? toDateTimeLocalValue(post?.publishedAt)}
          />
        </Field>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">
          내용
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        </p>
        <RichTextEditor
          name="content"
          defaultValue={initialContent}
          invalid={!!err("content")}
          onNonImageFiles={(files) => attachmentRef.current?.addFiles(files)}
        />
        <p className="text-xs text-muted-foreground">
          이미지는 끌어다 놓기·붙여넣기·이미지 주소 붙여넣기로 본문에 넣을 수 있습니다. PDF·HWP 등
          문서를 본문에 끌어다 놓으면 첨부파일로 등록됩니다.
          {board.layout === "gallery" &&
            " 본문의 첫 번째 사진이 목록·메인 화면의 대표 사진으로 사용됩니다."}
        </p>
        {err("content")?.map((e) => (
          <p key={e} className="text-xs text-danger" role="alert">
            {e}
          </p>
        ))}
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">첨부파일</p>
        <AttachmentManager ref={attachmentRef} initial={attachments} />
      </div>

      <div className="flex flex-wrap gap-6">
        <Checkbox
          name="isPinned"
          defaultChecked={checked("isPinned", post?.isPinned ?? false)}
          label="상단 고정(공지)"
        />
        <Checkbox
          name="isPublished"
          defaultChecked={checked("isPublished", post?.isPublished ?? true)}
          label="게시 (해제 시 비공개 저장)"
        />
      </div>
      <div className="flex gap-2 border-t border-border pt-5">
        <SubmitButton pendingText="저장 중…">{post ? "수정" : "등록"}</SubmitButton>
        <ButtonLink href={`/admin/boards/${board.key}`} variant="secondary">
          취소
        </ButtonLink>
      </div>
    </form>
  );
}
