"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveStatAction } from "@/lib/actions/content.actions";
import { initialActionState, type StatHighlight } from "@/types";

/** 숫자로 보는 센터 — 한 줄 편집 폼 (stat 없으면 새 항목) */
export function StatForm({ stat }: { stat?: StatHighlight }) {
  const [state, action] = useActionState(saveStatAction, initialActionState);
  const v = state.values;
  const firstError = state.fieldErrors && Object.values(state.fieldErrors).flat()[0];
  const id = stat ? `stat-${stat.id}` : "stat-new";
  return (
    <form
      action={action}
      className="grid items-end gap-2 sm:grid-cols-[1.5fr_1fr_0.6fr_1.5fr_0.6fr_auto_auto]"
    >
      {stat && <input type="hidden" name="id" value={stat.id} />}
      <label className="text-xs text-muted-foreground">
        항목명
        <Input
          name="label"
          defaultValue={v?.label ?? stat?.label}
          placeholder="예: 탄소중립 교육 참여"
          required
          aria-describedby={`${id}-msg`}
        />
      </label>
      <label className="text-xs text-muted-foreground">
        수치
        <Input name="value" type="number" min={0} defaultValue={v?.value ?? stat?.value} required />
      </label>
      <label className="text-xs text-muted-foreground">
        단위
        <Input name="unit" defaultValue={v?.unit ?? stat?.unit} placeholder="명" />
      </label>
      <label className="text-xs text-muted-foreground">
        기준
        <Input
          name="description"
          defaultValue={v?.description ?? stat?.description}
          placeholder="예: 2025년 누적"
        />
      </label>
      <label className="text-xs text-muted-foreground">
        순서
        <Input
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={v?.sortOrder ?? stat?.sortOrder ?? 0}
        />
      </label>
      <Checkbox
        name="isVisible"
        defaultChecked={v ? v.isVisible === "on" : (stat?.isVisible ?? true)}
        label="표시"
        className="h-10"
      />
      <SubmitButton variant={stat ? "secondary" : "primary"} pendingText="…">
        {stat ? "저장" : "추가"}
      </SubmitButton>
      <div id={`${id}-msg`} className="sm:col-span-7">
        {firstError && <p className="text-xs text-danger">{firstError}</p>}
        {state.ok && state.message && !stat && (
          <Alert tone="success" className="py-1.5">
            {state.message}
          </Alert>
        )}
      </div>
    </form>
  );
}
