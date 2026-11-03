import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "success" | "danger";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-border bg-muted text-foreground",
    success: "border-primary/30 bg-primary-soft text-foreground",
    danger: "border-danger/30 bg-danger-soft text-danger",
  };
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("rounded-lg border px-4 py-3 text-sm", tones[tone], className)}
    >
      {children}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "primary" | "warning";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary-soft text-primary",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} aria-hidden />;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>{children}</div>
  );
}
