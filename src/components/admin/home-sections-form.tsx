"use client";

import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";
import type { ComponentProps } from "react";
import { useActionState, useState } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { Alert } from "@/components/ui/feedback";
import { Fresh } from "@/components/ui/fresh";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveHomeSectionOrderAction } from "@/lib/actions/settings.actions";
import {
  DEFAULT_HOME_SECTION_ORDER,
  HOME_SECTIONS,
  type HomeSectionKey,
} from "@/lib/config/home-sections";
import { cn } from "@/lib/utils/cn";
import { initialActionState } from "@/types";

/** 메인 화면 영역 순서 — 위/아래 버튼으로 옮기고 저장 */
function HomeSectionsFormInner({ order: savedOrder }: { order: HomeSectionKey[] }) {
  const [state, action] = useActionState(saveHomeSectionOrderAction, initialActionState);
  const [order, setOrder] = useState(savedOrder);

  const move = (index: number, delta: -1 | 1) =>
    setOrder((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const isDefault = order.every((key, i) => key === DEFAULT_HOME_SECTION_ORDER[i]);

  return (
    <ActionForm action={action} className="max-w-2xl space-y-6">
      {state.message && <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>}
      <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        메인 비주얼(대표 사진) — 항상 맨 위
      </div>
      <ol className="space-y-2">
        {order.map((key, index) => {
          const section = HOME_SECTIONS.find((s) => s.key === key)!;
          return (
            <li
              key={key}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <input type="hidden" name="order" value={key} />
              <span className="w-6 shrink-0 text-center text-sm font-bold text-primary">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{section.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{section.hint}</span>
              </span>
              <MoveButton
                label={`${section.label} 위로`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="size-4" aria-hidden />
              </MoveButton>
              <MoveButton
                label={`${section.label} 아래로`}
                disabled={index === order.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="size-4" aria-hidden />
              </MoveButton>
            </li>
          );
        })}
      </ol>
      <p className="text-sm text-muted-foreground">
        내용이 없거나 메뉴 표시 설정에서 숨긴 영역(예: 활동 갤러리 게시판을 숨긴 경우)은 순서와
        관계없이 메인 화면에 나타나지 않습니다.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingText="저장 중…">저장</SubmitButton>
        <button
          type="button"
          onClick={() => setOrder(DEFAULT_HOME_SECTION_ORDER)}
          disabled={isDefault}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="size-4" aria-hidden /> 기본 순서로
        </button>
      </div>
    </ActionForm>
  );
}

function MoveButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      {children}
    </button>
  );
}

export function HomeSectionsForm(props: ComponentProps<typeof HomeSectionsFormInner>) {
  return (
    <Fresh>
      <HomeSectionsFormInner {...props} />
    </Fresh>
  );
}
