"use client";

import { use } from "react";
import { useFormStatus } from "react-dom";
import { FormPendingContext } from "./action-form";
import { Button, type ButtonSize, type ButtonVariant } from "./button";

/** form 제출 중 자동 비활성화되는 버튼 */
export function SubmitButton({
  children,
  pendingText = "처리 중…",
  variant,
  size,
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const status = useFormStatus();
  const pending = status.pending || use(FormPendingContext);
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      variant={variant}
      size={size}
      className={className}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
