"use client";

import { useActionState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { savePostAction } from "@/lib/actions/post.actions";
import { toDateTimeLocalValue } from "@/lib/utils/format";
import { initialActionState, type BoardDefinition, type Post } from "@/types";

/** 게시글 작성/수정 폼 */
export function PostForm({
  board,
  post,
  defaultAuthor,
}: {
  board: BoardDefinition;
  post?: Post;
  defaultAuthor: string;
}) {
  const [state, action] = useActionState(savePostAction, initialActionState);
  const err = (name: string) => state.fieldErrors?.[name];
  const v = state.values;
  const checked = (name: "isPinned" | "isPublished", fallback: boolean) =>
    v ? v[name] === "on" : fallback;

  return (
    <form action={action} className="max-w-3xl space-y-5">
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
      <Field
        label="내용"
        htmlFor="content"
        required
        errors={err("content")}
        hint="일반 텍스트로 저장되며 줄바꿈이 유지됩니다."
      >
        <Textarea
          id="content"
          name="content"
          rows={16}
          defaultValue={v?.content ?? post?.content}
          required
        />
      </Field>
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
