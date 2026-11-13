"use client";

import { useActionState } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { Fresh } from "@/components/ui/fresh";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveCommitteeMemberAction } from "@/lib/actions/content.actions";
import { initialActionState, type CommitteeMember } from "@/types";

function CommitteeMemberFormInner({ member }: { member?: CommitteeMember }) {
  const [state, action] = useActionState(saveCommitteeMemberAction, initialActionState);
  const v = state.values;
  const err = (k: string) => state.fieldErrors?.[k];
  return (
    <ActionForm action={action} className="max-w-2xl space-y-4">
      {member && <input type="hidden" name="id" value={member.id} />}
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="성명" htmlFor="name" required errors={err("name")}>
          <Input id="name" name="name" defaultValue={v?.name ?? member?.name} required />
        </Field>
        <Field label="소속" htmlFor="organization" required errors={err("organization")}>
          <Input
            id="organization"
            name="organization"
            defaultValue={v?.organization ?? member?.organization}
            required
          />
        </Field>
        <Field label="직위" htmlFor="position" errors={err("position")}>
          <Input id="position" name="position" defaultValue={v?.position ?? member?.position} />
        </Field>
        <Field label="정렬 순서" htmlFor="sortOrder" errors={err("sortOrder")} hint="작을수록 앞">
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={v?.sortOrder ?? member?.sortOrder ?? 0}
          />
        </Field>
      </div>
      <Field
        label="비고"
        htmlFor="note"
        errors={err("note")}
        hint="겸직·직책 등 (예: 충남 기후위기대응위원회 부위원장)"
      >
        <Input id="note" name="note" defaultValue={v?.note ?? member?.note} />
      </Field>
      <Checkbox
        name="isVisible"
        defaultChecked={v ? v.isVisible === "on" : (member?.isVisible ?? true)}
        label="홈페이지에 표시"
      />
      <div className="flex gap-2 border-t border-border pt-5">
        <SubmitButton pendingText="저장 중…">{member ? "수정" : "등록"}</SubmitButton>
        <ButtonLink href="/admin/committee" variant="secondary">
          취소
        </ButtonLink>
      </div>
    </ActionForm>
  );
}

export function CommitteeMemberForm({ member }: { member?: CommitteeMember }) {
  return (
    <Fresh dataKey={member?.updatedAt?.getTime()}>
      <CommitteeMemberFormInner member={member} />
    </Fresh>
  );
}
