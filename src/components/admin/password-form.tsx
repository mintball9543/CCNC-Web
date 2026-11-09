"use client";

import { Fresh } from "@/components/ui/fresh";
import { ActionForm } from "@/components/ui/action-form";
import { useActionState } from "react";
import { Alert } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { changePasswordAction } from "@/lib/actions/settings.actions";
import { initialActionState } from "@/types";

function PasswordFormInner() {
  const [state, action] = useActionState(changePasswordAction, initialActionState);
  const err = (k: string) => state.fieldErrors?.[k];
  return (
    <ActionForm action={action} className="max-w-sm space-y-4">
      {state.message && <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>}
      <input type="text" name="username" value="admin" autoComplete="username" readOnly hidden />
      <Field label="현재 비밀번호" htmlFor="currentPassword" errors={err("currentPassword")}>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field label="새 비밀번호" htmlFor="newPassword" errors={err("newPassword")} hint="10자 이상">
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
        />
      </Field>
      <Field label="새 비밀번호 확인" htmlFor="confirmPassword" errors={err("confirmPassword")}>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <SubmitButton pendingText="변경 중…">비밀번호 변경</SubmitButton>
    </ActionForm>
  );
}

export function PasswordForm() {
  return (
    <Fresh>
      <PasswordFormInner />
    </Fresh>
  );
}
