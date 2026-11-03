"use client";

import { useFormStatus } from "react-dom";
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
  const { pending } = useFormStatus();
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
