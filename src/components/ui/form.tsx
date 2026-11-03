import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const controlBase =
  "w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 aria-[invalid=true]:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlBase, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea className={cn(controlBase, "min-h-32 py-2 leading-relaxed", className)} {...props} />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(controlBase, "h-10", className)} {...props} />;
}

export function Checkbox({
  label,
  className,
  ...props
}: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2 text-sm", className)}>
      <input type="checkbox" className="size-4 accent-[var(--primary)]" {...props} />
      <span>{label}</span>
    </label>
  );
}

interface FieldProps {
  label: ReactNode;
  htmlFor: string;
  required?: boolean;
  hint?: ReactNode;
  errors?: string[];
  children: ReactNode;
  className?: string;
}

/** 라벨 + 입력 + 도움말 + 오류 메시지 묶음 */
export function Field({ label, htmlFor, required, hint, errors, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {errors?.map((error) => (
        <p key={error} id={`${htmlFor}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ))}
    </div>
  );
}
