"use client";

import { useActionState, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { savePopupAction } from "@/lib/actions/popup.actions";
import { toDateTimeLocalValue } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { initialActionState, type Popup, type PopupPosition } from "@/types";
import { PopupPreview, type PopupDraft } from "./popup-preview";

function initialDraft(popup?: Popup, values?: Record<string, string>): PopupDraft {
  if (values) {
    return {
      title: values.title ?? "",
      content: values.content ?? "",
      imageUrl: values.imageUrl ?? "",
      position: (values.position as PopupPosition) ?? "center",
      left: values.left ?? "0",
      top: values.top ?? "0",
      width: values.width ?? "400",
      height: values.height ?? "",
    };
  }
  return {
    title: popup?.title ?? "",
    content: popup?.content ?? "",
    imageUrl: popup?.imageUrl ?? "",
    position: popup?.position ?? "center",
    left: String(popup?.left ?? 80),
    top: String(popup?.top ?? 120),
    width: String(popup?.width ?? 400),
    height: popup?.height ? String(popup.height) : "",
  };
}

/**
 * 팝업 생성/수정 폼.
 * 위치(중앙 / 좌상단 좌표)와 크기(너비 / 높이)를 입력하면 오른쪽 미리보기에 즉시 반영된다.
 */
export function PopupForm({ popup }: { popup?: Popup }) {
  const [state, action] = useActionState(savePopupAction, initialActionState);
  const [draft, setDraft] = useState<PopupDraft>(() => initialDraft(popup));

  // 검증 실패로 서버가 입력값을 돌려준 경우 미리보기 상태도 동기화
  const [syncedValues, setSyncedValues] = useState(state.values);
  if (state.values !== syncedValues) {
    setSyncedValues(state.values);
    if (state.values) setDraft(initialDraft(popup, state.values));
  }

  const err = (name: string) => state.fieldErrors?.[name];
  const v = state.values;
  const set = (key: keyof PopupDraft) => (e: { target: { value: string } }) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <form action={action} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_520px]">
      <div className="space-y-6">
        {popup && <input type="hidden" name="id" value={popup.id} />}
        {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

        <fieldset className="space-y-4">
          <legend className="mb-2 font-semibold">내용</legend>
          <Field
            label="제목"
            htmlFor="title"
            required
            errors={err("title")}
            hint="팝업 상단 제목이자 관리용 이름입니다."
          >
            <Input id="title" name="title" value={draft.title} onChange={set("title")} required />
          </Field>
          <Field
            label="본문"
            htmlFor="content"
            errors={err("content")}
            hint="일반 텍스트 (줄바꿈 유지)"
          >
            <Textarea
              id="content"
              name="content"
              rows={5}
              value={draft.content}
              onChange={set("content")}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="이미지 URL"
              htmlFor="imageUrl"
              errors={err("imageUrl")}
              hint="https://… 또는 /uploads/…"
            >
              <Input
                id="imageUrl"
                name="imageUrl"
                value={draft.imageUrl}
                onChange={set("imageUrl")}
              />
            </Field>
            <Field label="이미지 대체 텍스트" htmlFor="imageAlt" errors={err("imageAlt")}>
              <Input
                id="imageAlt"
                name="imageAlt"
                defaultValue={v?.imageAlt ?? popup?.imageAlt ?? ""}
              />
            </Field>
          </div>
          <Field
            label="클릭 시 이동 링크"
            htmlFor="linkUrl"
            errors={err("linkUrl")}
            hint="외부 주소는 새 창으로 열립니다."
          >
            <Input id="linkUrl" name="linkUrl" defaultValue={v?.linkUrl ?? popup?.linkUrl ?? ""} />
          </Field>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 font-semibold">위치 · 크기</legend>
          <div className="flex gap-2" role="radiogroup" aria-label="표시 위치">
            {(
              [
                ["center", "화면 중앙"],
                ["custom", "좌표 지정 (좌상단 기준)"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={cn(
                  "cursor-pointer rounded-lg border px-4 py-2 text-sm",
                  draft.position === value
                    ? "border-primary bg-primary-soft font-medium text-primary"
                    : "border-border",
                )}
              >
                <input
                  type="radio"
                  name="position"
                  value={value}
                  checked={draft.position === value}
                  onChange={set("position")}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="좌측 X (px)" htmlFor="left" errors={err("left")}>
              <Input
                id="left"
                name="left"
                type="number"
                min={0}
                value={draft.left}
                onChange={set("left")}
                disabled={draft.position === "center"}
              />
            </Field>
            <Field label="상단 Y (px)" htmlFor="top" errors={err("top")}>
              <Input
                id="top"
                name="top"
                type="number"
                min={0}
                value={draft.top}
                onChange={set("top")}
                disabled={draft.position === "center"}
              />
            </Field>
            <Field label="너비 (px)" htmlFor="width" required errors={err("width")}>
              <Input
                id="width"
                name="width"
                type="number"
                min={200}
                max={1600}
                value={draft.width}
                onChange={set("width")}
              />
            </Field>
            <Field label="높이 (px)" htmlFor="height" errors={err("height")} hint="비우면 자동">
              <Input
                id="height"
                name="height"
                type="number"
                min={100}
                max={1600}
                value={draft.height}
                onChange={set("height")}
              />
            </Field>
          </div>
          {draft.position === "center" && (
            <>
              {/* disabled 입력은 전송되지 않으므로 값 유지용 hidden 필드 */}
              <input type="hidden" name="left" value={draft.left || 0} />
              <input type="hidden" name="top" value={draft.top || 0} />
            </>
          )}
          <p className="text-xs text-muted-foreground">
            화면 너비 768px 미만(모바일)에서는 좌표와 관계없이 중앙에 표시되며, 화면보다 큰 크기는
            자동으로 축소됩니다.
          </p>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 font-semibold">게시 설정</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="시작 일시" htmlFor="startsAt" errors={err("startsAt")} hint="비우면 즉시">
              <Input
                id="startsAt"
                name="startsAt"
                type="datetime-local"
                defaultValue={v?.startsAt ?? toDateTimeLocalValue(popup?.startsAt)}
              />
            </Field>
            <Field label="종료 일시" htmlFor="endsAt" errors={err("endsAt")} hint="비우면 계속">
              <Input
                id="endsAt"
                name="endsAt"
                type="datetime-local"
                defaultValue={v?.endsAt ?? toDateTimeLocalValue(popup?.endsAt)}
              />
            </Field>
            <Field
              label="정렬 순서"
              htmlFor="sortOrder"
              errors={err("sortOrder")}
              hint="작을수록 먼저 표시"
            >
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={v?.sortOrder ?? popup?.sortOrder ?? 0}
              />
            </Field>
          </div>
          <Checkbox
            name="isActive"
            defaultChecked={v ? v.isActive === "on" : (popup?.isActive ?? false)}
            label="팝업 사용 (On)"
          />
        </fieldset>

        <div className="flex gap-2 border-t border-border pt-5">
          <SubmitButton pendingText="저장 중…">{popup ? "수정" : "등록"}</SubmitButton>
          <ButtonLink href="/admin/popups" variant="secondary">
            취소
          </ButtonLink>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <PopupPreview draft={draft} />
      </div>
    </form>
  );
}
