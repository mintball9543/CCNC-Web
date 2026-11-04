"use client";

import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveMenuSettingsAction } from "@/lib/actions/settings.actions";
import { sectionKey } from "@/lib/config/menu-visibility";
import { cn } from "@/lib/utils/cn";
import { initialActionState, type NavSection } from "@/types";

/** 메뉴 표시 설정 — 대메뉴/하위 메뉴 단위로 켜고 끈다 */
export function MenuSettingsForm({
  navigation,
  settings,
}: {
  navigation: NavSection[];
  settings: Record<string, boolean>;
}) {
  const [state, action] = useActionState(saveMenuSettingsAction, initialActionState);
  const [visible, setVisible] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of navigation) {
      init[sectionKey(s.key)] = settings[sectionKey(s.key)] !== false;
      for (const i of s.items) init[i.href] = settings[i.href] !== false;
    }
    return init;
  });
  const toggle = (key: string) => setVisible((v) => ({ ...v, [key]: !v[key] }));

  return (
    <form action={action} className="space-y-6">
      {state.message && <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {navigation.map((section) => {
          const sKey = sectionKey(section.key);
          const sectionOn = visible[sKey];
          return (
            <fieldset
              key={section.key}
              className={cn(
                "rounded-xl border bg-card p-4",
                sectionOn ? "border-border" : "border-dashed border-border opacity-70",
              )}
            >
              <legend className="sr-only">{section.title}</legend>
              <Toggle
                name={sKey}
                checked={sectionOn}
                onChange={() => toggle(sKey)}
                label={section.title}
                strong
              />
              <ul className="mt-3 space-y-1 border-t border-border pt-3">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Toggle
                      name={item.href}
                      checked={visible[item.href]}
                      disabled={!sectionOn}
                      onChange={() => toggle(item.href)}
                      label={item.title}
                      hint={item.href}
                    />
                  </li>
                ))}
              </ul>
            </fieldset>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        숨긴 메뉴는 상단 메뉴·모바일 메뉴·좌측 메뉴·사이트맵·메인 화면 바로가기에서 사라지고, 주소로
        직접 접근하면 404 페이지가 표시됩니다. 게시판을 숨겨도 관리자 화면에서는 계속 관리할 수
        있습니다.
      </p>
      <SubmitButton pendingText="저장 중…">저장</SubmitButton>
    </form>
  );
}

function Toggle({
  name,
  checked,
  disabled,
  onChange,
  label,
  hint,
  strong,
}: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
  strong?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-muted",
        disabled && "cursor-not-allowed",
      )}
    >
      <span className="min-w-0">
        <span className={cn("block truncate", strong ? "font-bold" : "text-sm")}>{label}</span>
        {hint && <span className="block truncate text-xs text-muted-foreground">{hint}</span>}
      </span>
      <input
        type="checkbox"
        name="visible"
        value={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
      />
      {/* 대메뉴가 꺼져 있어도 하위 설정값은 유지되도록 hidden 으로 함께 전송 */}
      {disabled && checked && <input type="hidden" name="visible" value={name} />}
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
          checked ? "bg-primary" : "bg-border",
          disabled && "opacity-50",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition",
            checked ? "left-5.5" : "left-0.5",
          )}
        />
      </span>
      <span className="sr-only">{checked ? "표시" : "숨김"}</span>
    </label>
  );
}
