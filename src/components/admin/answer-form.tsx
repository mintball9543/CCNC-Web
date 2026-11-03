"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveAnswerAction } from "@/lib/actions/inquiry-admin.actions";
import { initialActionState } from "@/types";

/** 문의 답변 등록/수정 */
export function AnswerForm({ inquiryId, answer }: { inquiryId: number; answer: string | null }) {
  const [state, action] = useActionState(saveAnswerAction, initialActionState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={inquiryId} />
      {state.message && <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>}
      <Field
        label={answer ? "답변 수정" : "답변 작성"}
        htmlFor="answer"
        errors={state.fieldErrors?.answer}
      >
        <Textarea
          id="answer"
          name="answer"
          rows={10}
          defaultValue={state.values?.answer ?? answer ?? ""}
          required
        />
      </Field>
      <SubmitButton pendingText="저장 중…">{answer ? "답변 수정" : "답변 등록"}</SubmitButton>
    </form>
  );
}
