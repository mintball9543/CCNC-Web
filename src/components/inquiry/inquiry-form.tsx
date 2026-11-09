"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form";
import { Fresh } from "@/components/ui/fresh";
import { SubmitButton } from "@/components/ui/submit-button";
import { createInquiryAction } from "@/lib/actions/inquiry.actions";
import { initialActionState } from "@/types";

function InquiryFormInner() {
  const [state, action] = useActionState(createInquiryAction, initialActionState);
  const [isPrivate, setIsPrivate] = useState(true);
  const err = (name: string) => state.fieldErrors?.[name];

  return (
    <ActionForm action={action} className="space-y-5" noValidate>
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="이름" htmlFor="authorName" required errors={err("authorName")}>
          <Input
            id="authorName"
            name="authorName"
            autoComplete="name"
            required
            aria-invalid={!!err("authorName")}
          />
        </Field>
        <Field
          label="이메일"
          htmlFor="email"
          required
          errors={err("email")}
          hint="답변 안내를 위해 사용됩니다."
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!err("email")}
          />
        </Field>
        <Field label="연락처" htmlFor="phone" errors={err("phone")}>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </Field>
      </div>

      <Field label="제목" htmlFor="title" required errors={err("title")}>
        <Input id="title" name="title" required aria-invalid={!!err("title")} />
      </Field>
      <Field label="내용" htmlFor="content" required errors={err("content")}>
        <Textarea id="content" name="content" rows={10} required aria-invalid={!!err("content")} />
      </Field>

      {/* 스팸 방지 — 사람에게는 보이지 않는 필드 */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">웹사이트</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="space-y-3 rounded-xl border border-border p-4">
        <legend className="px-1 text-sm font-medium">공개 설정</legend>
        <Checkbox
          name="isPrivate"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          label="비공개로 등록 (작성자와 관리자만 열람)"
        />
        <Field
          label="비밀번호"
          htmlFor="password"
          required={isPrivate}
          errors={isPrivate ? err("password") : undefined}
          hint={
            isPrivate
              ? "비공개 문의를 열람·수정·삭제할 때 필요합니다. (4자 이상)"
              : "공개 문의는 비밀번호가 필요 없습니다. 답변 전까지 이 브라우저에서 수정·삭제할 수 있습니다."
          }
          className="sm:max-w-sm"
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required={isPrivate}
            disabled={!isPrivate}
            placeholder={isPrivate ? undefined : "입력 불필요"}
            aria-invalid={isPrivate && !!err("password")}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-2 rounded-xl border border-border p-4 text-sm">
        <legend className="px-1 font-medium">개인정보 수집·이용 동의 (필수)</legend>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>수집 항목: 이름, 이메일, 연락처(선택)</li>
          <li>수집 목적: 문의 접수 및 답변 안내</li>
          <li>보유 기간: 개인정보처리방침에 따름 (확정 후 게시)</li>
        </ul>
        <p className="text-muted-foreground">
          자세한 내용은{" "}
          <Link href="/privacy" className="text-primary underline">
            개인정보처리방침
          </Link>
          을 확인하세요.
        </p>
        <Checkbox name="privacyConsent" label="위 내용에 동의합니다." />
        {err("privacyConsent")?.map((e) => (
          <p key={e} className="text-xs text-danger" role="alert">
            {e}
          </p>
        ))}
      </fieldset>

      <div className="flex justify-end gap-2">
        <Link
          href="/news/inquiry"
          className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm hover:bg-muted"
        >
          취소
        </Link>
        <SubmitButton pendingText="등록 중…">문의 등록</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function InquiryForm() {
  return (
    <Fresh>
      <InquiryFormInner />
    </Fresh>
  );
}
