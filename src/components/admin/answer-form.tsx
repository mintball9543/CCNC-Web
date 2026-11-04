"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveAnswerAction } from "@/lib/actions/inquiry-admin.actions";
import { initialActionState } from "@/types";

/** 문의 답변 등록/수정 + 작성자 알림 메일 */
export function AnswerForm({
  inquiryId,
  answer,
  email,
  mailConfigured,
}: {
  inquiryId: number;
  answer: string | null;
  email: string;
  mailConfigured: boolean;
}) {
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
      <Checkbox
        name="notify"
        defaultChecked={state.values ? state.values.notify === "on" : true}
        label={`작성자(${email})에게 답변 알림 메일 보내기`}
      />
      {!mailConfigured && (
        <p className="text-xs text-muted-foreground">
          메일 서버(SMTP)가 설정되지 않아 현재는 메일이 발송되지 않습니다. 운영 환경의 .env 에 SMTP
          정보를 입력하세요.
        </p>
      )}
      <SubmitButton pendingText="저장 중…">{answer ? "답변 수정" : "답변 등록"}</SubmitButton>
    </form>
  );
}
