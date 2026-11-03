"use client";

import type { MouseEvent, ReactNode } from "react";
import { SubmitButton } from "./submit-button";
import type { ButtonSize, ButtonVariant } from "./button";

/** 삭제 등 되돌릴 수 없는 작업 전 확인창을 띄우는 제출 버튼 */
export function ConfirmSubmitButton({
  message,
  children,
  variant = "danger",
  size = "sm",
}: {
  message: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <span
      onClickCapture={(event: MouseEvent) => {
        if (!window.confirm(message)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <SubmitButton variant={variant} size={size}>
        {children}
      </SubmitButton>
    </span>
  );
}
