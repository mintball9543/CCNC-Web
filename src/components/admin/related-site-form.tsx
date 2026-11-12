"use client";

import { useActionState, useState, type ComponentProps } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { Fresh } from "@/components/ui/fresh";
import { RelatedSiteCard } from "@/components/layout/related-site-card";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveRelatedSiteAction } from "@/lib/actions/content.actions";
import { initialActionState, type RelatedSite } from "@/types";
import { ImageUploadField } from "./image-upload-field";

function RelatedSiteFormInner({ site }: { site?: RelatedSite }) {
  const [state, action] = useActionState(saveRelatedSiteAction, initialActionState);
  const [logoUrl, setLogoUrl] = useState(site?.logoUrl ?? "");
  const [name, setName] = useState(site?.name ?? "");
  const [url, setUrl] = useState(site?.url ?? "");
  const err = (k: string) => state.fieldErrors?.[k];

  return (
    <ActionForm action={action} className="grid gap-8 xl:grid-cols-[minmax(0,42rem)_minmax(0,1fr)]">
      <div className="space-y-5">
        {site && <input type="hidden" name="id" value={site.id} />}
        {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

        <Field
          label="기관명"
          htmlFor="name"
          required
          errors={err("name")}
          hint="로고 아래에 표시됩니다."
        >
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field
          label="사이트 주소"
          htmlFor="url"
          required
          errors={err("url")}
          hint="https://… 형식. 누르면 새 창으로 열립니다."
        >
          <Input
            id="url"
            name="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </Field>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">로고 이미지</p>
          <div className="max-w-sm">
            <ImageUploadField
              name="logoUrl"
              value={logoUrl}
              onChange={setLogoUrl}
              aspect="aspect-[266/65]"
              fit="contain"
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
            label="메인 화면에 표시"
            className="h-10"
          />
        </div>

        <div className="flex gap-2 border-t border-border pt-5">
          <SubmitButton pendingText="저장 중…">{site ? "수정" : "등록"}</SubmitButton>
          <ButtonLink href="/admin/related-sites" variant="secondary">
            취소
          </ButtonLink>
        </div>
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start" aria-label="미리보기">
        <div className="rounded-xl border border-border bg-muted/40 p-5">
          <p className="text-sm font-semibold">메인 화면 미리보기</p>
          <p className="mt-1 text-xs text-muted-foreground">
            저장하면 홈페이지 맨 아래 &lsquo;관련 사이트&rsquo;에 이렇게 표시됩니다. 카드를 누르면
            입력한 주소가 새 창으로 열립니다.
          </p>
          <div className="mt-4 max-w-60">
            <RelatedSiteCard name={name || "기관명"} url={url} logoUrl={logoUrl || null} />
          </div>
        </div>
      </aside>
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
