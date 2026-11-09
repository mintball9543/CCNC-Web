"use client";

import { Lock, Pencil } from "lucide-react";
import { useActionState, useState } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { unlockInquiryAction, type UnlockedInquiry } from "@/lib/actions/inquiry.actions";
import type { ActionState } from "@/types";
import { InquiryAnswer } from "./inquiry-answer";
import { InquiryDeleteButton } from "./inquiry-delete-button";
import { InquiryEditForm } from "./inquiry-edit-form";

const initial: ActionState<UnlockedInquiry> = { ok: false };

/**
 * 비밀번호로 본인 확인.
 * - view: 비공개 문의 열람 → 답변 전이면 수정·삭제 버튼 표시
 * - edit: 수정 화면에서 본인 확인 후 바로 수정 폼 표시
 */
export function InquiryPasswordGate({
  id,
  mode = "view",
  message = "비공개 문의입니다. 작성 시 입력한 비밀번호를 입력하세요.",
}: {
  id: number;
  mode?: "view" | "edit";
  message?: string;
}) {
  const [state, action] = useActionState(unlockInquiryAction, initial);
  const [password, setPassword] = useState("");
  const [editing, setEditing] = useState(mode === "edit");

  if (state.ok && state.data) {
    const data = state.data;
    const answered = data.answeredAt !== null;

    if (editing && !answered) {
      return (
        <div className="space-y-4">
          <InquiryEditForm
            inquiry={data}
            currentPassword={password}
            onCancel={mode === "view" ? () => setEditing(false) : undefined}
          />
          <div className="flex justify-end border-t border-border pt-4">
            <InquiryDeleteButton id={id} currentPassword={password} />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {mode === "edit" && answered && (
          <Alert tone="info">답변이 등록된 문의는 수정하거나 삭제할 수 없습니다.</Alert>
        )}
        <div className="min-h-32 leading-relaxed whitespace-pre-line">{data.content}</div>
        <InquiryAnswer answer={data.answer} answeredAt={data.answeredAt} />
        {!answered && (
          <div className="flex items-start justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil className="size-4" aria-hidden />
              수정
            </Button>
            <InquiryDeleteButton id={id} currentPassword={password} />
          </div>
        )}
      </div>
    );
  }

  return (
    <ActionForm
      action={action}
      className="mx-auto max-w-sm space-y-3 rounded-xl border border-border p-6 text-center"
    >
      <Lock className="mx-auto size-6 text-muted-foreground" aria-hidden />
      <p className="text-sm">{message}</p>
      <input type="hidden" name="id" value={id} />
      <label htmlFor="inquiry-password" className="sr-only">
        비밀번호
      </label>
      <Input
        id="inquiry-password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {state.message && <Alert tone="danger">{state.message}</Alert>}
      <SubmitButton className="w-full">확인</SubmitButton>
    </ActionForm>
  );
}
