"use client";

import { useActionState, useState, type ComponentProps } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { Fresh } from "@/components/ui/fresh";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveRelatedSiteAction } from "@/lib/actions/content.actions";
import { initialActionState, type RelatedSite } from "@/types";
import { ImageUploadField } from "./image-upload-field";

function RelatedSiteFormInner({ site }: { site?: RelatedSite }) {
  const [state, action] = useActionState(saveRelatedSiteAction, initialActionState);
  const [logoUrl, setLogoUrl] = useState(site?.logoUrl ?? "");
  const err = (k: string) => state.fieldErrors?.[k];

  return (
    <ActionForm action={action} className="max-w-2xl space-y-5">
      {site && <input type="hidden" name="id" value={site.id} />}
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <Field
        label="기관명"
        htmlFor="name"
        required
        errors={err("name")}
        hint="로고 아래에 표시됩니다."
      >
        <Input id="name" name="name" defaultValue={site?.name} required />
      </Field>
      <Field
        label="사이트 주소"
        htmlFor="url"
        required
        errors={err("url")}
        hint="https://… 형식. 누르면 새 창으로 열립니다."
      >
        <Input id="url" name="url" type="url" defaultValue={site?.url} required />
      </Field>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">로고 이미지</p>
        <div className="max-w-sm">
          <ImageUploadField
            name="logoUrl"
            value={logoUrl}
            onChange={setLogoUrl}
            aspect="aspect-[266/65]"
            invalid={!!err("logoUrl")}
          />
        </div>
        {err("logoUrl")?.map((e) => (
          <p key={e} className="text-xs text-danger">
            {e}
          </p>
        ))}
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            가로 266×65 비율(또는 그 2배) 이미지를 권장합니다. 비우면 기관명을 글자로 표시합니다.
          </p>
          {logoUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setLogoUrl("")}>
              로고 지우기
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <Field
          label="순서"
          htmlFor="sortOrder"
          errors={err("sortOrder")}
          hint="작을수록 앞"
          className="w-32"
        >
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={site?.sortOrder ?? 0}
          />
        </Field>
        <Checkbox
          name="isVisible"
          defaultChecked={site?.isVisible ?? true}
          label="홈페이지 하단에 표시"
          className="h-10"
        />
      </div>

      <div className="flex gap-2 border-t border-border pt-5">
        <SubmitButton pendingText="저장 중…">{site ? "수정" : "등록"}</SubmitButton>
        <ButtonLink href="/admin/related-sites" variant="secondary">
          취소
        </ButtonLink>
      </div>
    </ActionForm>
  );
}

export function RelatedSiteForm(props: ComponentProps<typeof RelatedSiteFormInner>) {
  return (
    <Fresh dataKey={props.site?.updatedAt?.getTime()}>
      <RelatedSiteFormInner {...props} />
    </Fresh>
  );
}
