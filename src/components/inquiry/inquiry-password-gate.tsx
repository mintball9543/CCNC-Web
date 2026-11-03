"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { unlockInquiryAction, type UnlockedInquiry } from "@/lib/actions/inquiry.actions";
import type { ActionState } from "@/types";
import { InquiryAnswer } from "./inquiry-answer";

const initial: ActionState<UnlockedInquiry> = { ok: false };

/** 비공개 문의 — 작성 시 입력한 비밀번호 확인 후 본문/답변 표시 */
export function InquiryPasswordGate({ id }: { id: number }) {
  const [state, action] = useActionState(unlockInquiryAction, initial);

  if (state.ok && state.data) {
    return (
      <div className="space-y-6">
        <div className="min-h-32 leading-relaxed whitespace-pre-line">{state.data.content}</div>
        <InquiryAnswer answer={state.data.answer} answeredAt={state.data.answeredAt} />
      </div>
    );
  }

  return (
    <form
      action={action}
      className="mx-auto max-w-sm space-y-3 rounded-xl border border-border p-6 text-center"
    >
      <Lock className="mx-auto size-6 text-muted-foreground" aria-hidden />
      <p className="text-sm">비공개 문의입니다. 작성 시 입력한 비밀번호를 입력하세요.</p>
      <input type="hidden" name="id" value={id} />
      <label htmlFor="inquiry-password" className="sr-only">
        비밀번호
      </label>
      <Input
        id="inquiry-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state.message && <Alert tone="danger">{state.message}</Alert>}
      <SubmitButton className="w-full">확인</SubmitButton>
    </form>
  );
}
