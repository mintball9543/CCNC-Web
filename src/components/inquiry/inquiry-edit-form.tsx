"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateOwnInquiryAction } from "@/lib/actions/inquiry.actions";
import { initialActionState } from "@/types";

export interface EditableInquiry {
  id: number;
  title: string;
  content: string;
  phone: string | null;
  isPrivate: boolean;
  hasPassword: boolean;
}

/**
 * 작성자 본인의 문의 수정 폼 (답변 전까지만).
 * currentPassword: 비밀번호로 본인 확인을 마친 경우 함께 전송 (서버에서 다시 검증)
 */
export function InquiryEditForm({
  inquiry,
  currentPassword,
  onCancel,
}: {
  inquiry: EditableInquiry;
  currentPassword?: string;
  /** 지정하지 않으면 상세 페이지로 돌아가는 링크 */
  onCancel?: () => void;
}) {
  const [state, action] = useActionState(updateOwnInquiryAction, initialActionState);
  const [isPrivate, setIsPrivate] = useState(inquiry.isPrivate);
  const err = (name: string) => state.fieldErrors?.[name];
  const needsNewPassword = isPrivate && !inquiry.hasPassword;

  return (
    <ActionForm action={action} className="space-y-5" noValidate>
      <input type="hidden" name="id" value={inquiry.id} />
      {currentPassword && <input type="hidden" name="currentPassword" value={currentPassword} />}
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <Field label="제목" htmlFor="edit-title" required errors={err("title")}>
        <Input id="edit-title" name="title" defaultValue={inquiry.title} required />
      </Field>
      <Field label="내용" htmlFor="edit-content" required errors={err("content")}>
        <Textarea
          id="edit-content"
          name="content"
          rows={10}
          defaultValue={inquiry.content}
          required
        />
      </Field>
      <Field label="연락처" htmlFor="edit-phone" errors={err("phone")} className="sm:max-w-sm">
        <Input id="edit-phone" name="phone" type="tel" defaultValue={inquiry.phone ?? ""} />
      </Field>

      <fieldset className="space-y-3 rounded-xl border border-border p-4">
        <legend className="px-1 text-sm font-medium">공개 설정</legend>
        <Checkbox
          name="isPrivate"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          label="비공개 (작성자와 관리자만 열람)"
        />
        <Field
          label={inquiry.hasPassword ? "새 비밀번호 (변경할 때만 입력)" : "비밀번호"}
          htmlFor="edit-new-password"
          required={needsNewPassword}
          errors={isPrivate ? err("newPassword") : undefined}
          hint={isPrivate ? "4자 이상" : "공개 문의는 비밀번호가 필요 없습니다."}
          className="sm:max-w-sm"
        >
          <Input
            id="edit-new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            disabled={!isPrivate}
            required={needsNewPassword}
            placeholder={isPrivate ? undefined : "입력 불필요"}
          />
        </Field>
      </fieldset>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm hover:bg-muted"
          >
            취소
          </button>
        ) : (
          <Link
            href={`/news/inquiry/${inquiry.id}`}
            className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm hover:bg-muted"
          >
            취소
          </Link>
        )}
        <SubmitButton pendingText="저장 중…">수정 완료</SubmitButton>
      </div>
    </ActionForm>
  );
}
