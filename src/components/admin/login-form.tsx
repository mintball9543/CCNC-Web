"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Alert } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { loginAction } from "@/lib/actions/auth.actions";
import { initialActionState } from "@/types";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialActionState);
  const next = useSearchParams().get("next") ?? state.values?.next ?? "";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.message && <Alert tone="danger">{state.message}</Alert>}
      <Field label="아이디" htmlFor="username" errors={state.fieldErrors?.username}>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          defaultValue={state.values?.username}
          required
          autoFocus
        />
      </Field>
      <Field label="비밀번호" htmlFor="password" errors={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <SubmitButton className="w-full" size="lg" pendingText="로그인 중…">
        로그인
      </SubmitButton>
    </form>
  );
}
