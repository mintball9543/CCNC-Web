"use client";

import { Fresh } from "@/components/ui/fresh";
import type { ComponentProps } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { useActionState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveOrgMemberAction } from "@/lib/actions/content.actions";
import { initialActionState, type OrgMember } from "@/types";

function OrgMemberFormInner({
  member,
  departments,
}: {
  member?: OrgMember;
  departments: string[];
}) {
  const [state, action] = useActionState(saveOrgMemberAction, initialActionState);
  const v = state.values;
  const err = (k: string) => state.fieldErrors?.[k];
  const checked = (k: "isHead" | "isVisible", fallback: boolean) => (v ? v[k] === "on" : fallback);
  return (
    <ActionForm action={action} className="max-w-2xl space-y-4">
      {member && <input type="hidden" name="id" value={member.id} />}
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="소속" htmlFor="department" required errors={err("department")}>
          <Input
            id="department"
            name="department"
            list="department-list"
            defaultValue={v?.department ?? member?.department}
            required
          />
          <datalist id="department-list">
            {departments.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </Field>
        <Field label="직위" htmlFor="position" required errors={err("position")}>
          <Input
            id="position"
            name="position"
            defaultValue={v?.position ?? member?.position}
            required
          />
        </Field>
        <Field label="성명" htmlFor="name" required errors={err("name")}>
          <Input id="name" name="name" defaultValue={v?.name ?? member?.name} required />
        </Field>
      </div>
      <Field label="담당 업무" htmlFor="duties" errors={err("duties")}>
        <Textarea
          id="duties"
          name="duties"
          rows={4}
          defaultValue={v?.duties ?? member?.duties}
          className="min-h-24"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="전화" htmlFor="phone" errors={err("phone")}>
          <Input id="phone" name="phone" defaultValue={v?.phone ?? member?.phone ?? ""} />
        </Field>
        <Field label="이메일" htmlFor="email" errors={err("email")} hint="기관 도메인 메일">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={v?.email ?? member?.email ?? ""}
          />
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
      <div className="flex flex-wrap gap-6">
        <Checkbox
          name="isHead"
          defaultChecked={checked("isHead", member?.isHead ?? false)}
          label="조직도 최상단에 표시 (센터장 등)"
        />
        <Checkbox
          name="isVisible"
          defaultChecked={checked("isVisible", member?.isVisible ?? true)}
          label="홈페이지에 표시"
        />
      </div>
      <div className="flex gap-2 border-t border-border pt-5">
        <SubmitButton pendingText="저장 중…">{member ? "수정" : "등록"}</SubmitButton>
        <ButtonLink href="/admin/organization" variant="secondary">
          취소
        </ButtonLink>
      </div>
    </ActionForm>
  );
}

export function OrgMemberForm(props: ComponentProps<typeof OrgMemberFormInner>) {
  return (
    <Fresh dataKey={props.member?.updatedAt?.getTime()}>
      <OrgMemberFormInner {...props} />
    </Fresh>
  );
}
