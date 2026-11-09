"use client";

import { Fresh } from "@/components/ui/fresh";
import type { ComponentProps } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { useActionState } from "react";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveContactAction } from "@/lib/actions/settings.actions";
import { initialActionState, type ContactSettings } from "@/types";

/** 기관 정보 — 하단(푸터)·오시는 길에 표시 */
function ContactFormInner({ contact }: { contact: ContactSettings }) {
  const [state, action] = useActionState(saveContactAction, initialActionState);
  const v = (k: keyof ContactSettings) => state.values?.[k] ?? contact[k];
  const err = (k: string) => state.fieldErrors?.[k];
  return (
    <ActionForm action={action} className="max-w-3xl space-y-4">
      {state.message && <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <Field label="우편번호" htmlFor="postalCode" errors={err("postalCode")}>
          <Input id="postalCode" name="postalCode" defaultValue={v("postalCode")} />
        </Field>
        <Field label="도로명 주소" htmlFor="address" errors={err("address")}>
          <Input id="address" name="address" defaultValue={v("address")} />
        </Field>
      </div>
      <Field label="상세 주소" htmlFor="addressDetail" errors={err("addressDetail")}>
        <Input id="addressDetail" name="addressDetail" defaultValue={v("addressDetail")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="대표 전화" htmlFor="phone" errors={err("phone")}>
          <Input id="phone" name="phone" defaultValue={v("phone")} />
        </Field>
        <Field label="팩스" htmlFor="fax" errors={err("fax")}>
          <Input id="fax" name="fax" defaultValue={v("fax")} />
        </Field>
        <Field
          label="대표 이메일"
          htmlFor="email"
          errors={err("email")}
          hint="기관 도메인 메일 사용"
        >
          <Input id="email" name="email" type="email" defaultValue={v("email")} />
        </Field>
      </div>
      <Field label="대중교통 안내 (오시는 길)" htmlFor="transit" errors={err("transit")}>
        <Textarea
          id="transit"
          name="transit"
          rows={3}
          defaultValue={v("transit")}
          className="min-h-20"
        />
      </Field>
      <Field label="주차 안내 (오시는 길)" htmlFor="parking" errors={err("parking")}>
        <Textarea
          id="parking"
          name="parking"
          rows={2}
          defaultValue={v("parking")}
          className="min-h-16"
        />
      </Field>
      <SubmitButton pendingText="저장 중…">저장</SubmitButton>
    </ActionForm>
  );
}

export function ContactForm(props: ComponentProps<typeof ContactFormInner>) {
  return (
    <Fresh>
      <ContactFormInner {...props} />
    </Fresh>
  );
}
