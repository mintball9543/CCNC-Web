"use client";

import { useActionState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveHeroSlideAction } from "@/lib/actions/content.actions";
import { initialActionState, type HeroSlide } from "@/types";
import { ImageUploadField } from "./image-upload-field";

export function HeroSlideForm({ slide }: { slide?: HeroSlide }) {
  const [state, action] = useActionState(saveHeroSlideAction, initialActionState);
  const v = state.values;
  const err = (k: string) => state.fieldErrors?.[k];
  return (
    <form action={action} className="max-w-3xl space-y-4">
      {slide && <input type="hidden" name="id" value={slide.id} />}
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}
      <div className="space-y-1.5">
        <p className="text-sm font-medium">
          사진
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        </p>
        <ImageUploadField
          name="imageUrl"
          defaultValue={v?.imageUrl ?? slide?.imageUrl}
          invalid={!!err("imageUrl")}
        />
        {err("imageUrl")?.map((e) => (
          <p key={e} className="text-xs text-danger">
            {e}
          </p>
        ))}
        <p className="text-xs text-muted-foreground">
          가로로 긴 사진(1920×800 이상)을 권장합니다. 글자가 왼쪽 아래에 겹쳐 표시됩니다.
        </p>
      </div>
      <Field
        label="사진 설명 (대체 텍스트)"
        htmlFor="imageAlt"
        required
        errors={err("imageAlt")}
        hint="예: 2025 탄소중립 실천 다짐대회 단체 사진"
      >
        <Input
          id="imageAlt"
          name="imageAlt"
          defaultValue={v?.imageAlt ?? slide?.imageAlt}
          required
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="큰 문구" htmlFor="title" errors={err("title")} hint="비우면 기본 문구">
          <Input id="title" name="title" defaultValue={v?.title ?? slide?.title} />
        </Field>
        <Field label="작은 문구" htmlFor="subtitle" errors={err("subtitle")}>
          <Input id="subtitle" name="subtitle" defaultValue={v?.subtitle ?? slide?.subtitle} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <Field
          label="'자세히 보기' 링크"
          htmlFor="linkUrl"
          errors={err("linkUrl")}
          hint="예: /news/center-news/12"
        >
          <Input id="linkUrl" name="linkUrl" defaultValue={v?.linkUrl ?? slide?.linkUrl ?? ""} />
        </Field>
        <Field label="순서" htmlFor="sortOrder" errors={err("sortOrder")}>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={v?.sortOrder ?? slide?.sortOrder ?? 0}
          />
        </Field>
      </div>
      <Checkbox
        name="isActive"
        defaultChecked={v ? v.isActive === "on" : (slide?.isActive ?? true)}
        label="메인 화면에 표시"
      />
      <div className="flex gap-2 border-t border-border pt-5">
        <SubmitButton pendingText="저장 중…">{slide ? "수정" : "등록"}</SubmitButton>
        <ButtonLink href="/admin/hero" variant="secondary">
          취소
        </ButtonLink>
      </div>
    </form>
  );
}
