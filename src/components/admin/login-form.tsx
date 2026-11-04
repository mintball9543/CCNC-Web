"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Alert } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { loginAction } from "@/lib/actions/auth.actions";
import { initialActionState } from "@/types";

/** 관리자 로그인 — 비밀번호만 입력 */
export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialActionState);
  const next = useSearchParams().get("next") ?? state.values?.next ?? "";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {/* 비밀번호 관리자(브라우저 저장)용 숨김 아이디 필드 */}
      <input type="text" name="username" value="admin" autoComplete="username" readOnly hidden />
      {state.message && <Alert tone="danger">{state.message}</Alert>}
      <Field label="관리자 비밀번호" htmlFor="password" errors={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
        />
      </Field>
      <SubmitButton className="w-full" size="lg" pendingText="로그인 중…">
        로그인
      </SubmitButton>
    </form>
  );
}
