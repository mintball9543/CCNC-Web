"use client";

import { Trash2 } from "lucide-react";
import { createContext, use, useCallback, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

interface BulkSelection {
  allChecked: boolean;
  toggleAll: (checked: boolean) => void;
}

const BulkSelectionContext = createContext<BulkSelection | null>(null);

/**
 * 관리자 목록 선택 삭제 폼.
 * 목록의 체크박스(name="ids")를 선택한 뒤 '선택 삭제'를 누르면 확인 후 한 번에 삭제한다.
 */
export function BulkDeleteForm({
  action,
  itemLabel = "게시글",
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  itemLabel?: string;
  children: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selection, setSelection] = useState({ count: 0, total: 0 });

  const boxes = () =>
    Array.from(formRef.current?.querySelectorAll<HTMLInputElement>('input[name="ids"]') ?? []);
  const refresh = useCallback(() => {
    const all = Array.from(
      formRef.current?.querySelectorAll<HTMLInputElement>('input[name="ids"]') ?? [],
    );
    setSelection({ count: all.filter((b) => b.checked).length, total: all.length });
  }, []);

  const toggleAll = (checked: boolean) => {
    for (const box of boxes()) box.checked = checked;
    refresh();
  };

  return (
    <BulkSelectionContext
      value={{ allChecked: selection.total > 0 && selection.count === selection.total, toggleAll }}
    >
      <form ref={formRef} action={action} onChange={refresh}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {selection.count > 0 ? `${selection.count}건 선택됨` : "삭제할 항목을 선택하세요."}
          </p>
          <DeleteSelectedButton count={selection.count} itemLabel={itemLabel} />
        </div>
        {children}
      </form>
    </BulkSelectionContext>
  );
}

function DeleteSelectedButton({ count, itemLabel }: { count: number; itemLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="danger"
      size="sm"
      disabled={count === 0 || pending}
      onClick={(event) => {
        if (
          !window.confirm(
            `선택한 ${itemLabel} ${count}건을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <Trash2 className="size-4" aria-hidden />
      {pending ? "삭제 중…" : `선택 삭제${count > 0 ? ` (${count})` : ""}`}
    </Button>
  );
}

/** 표 머리글의 전체 선택 체크박스 */
export function SelectAllCheckbox({ label = "전체 선택" }: { label?: string }) {
  const selection = use(BulkSelectionContext);
  if (!selection) return null;
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={selection.allChecked}
      onChange={(e) => selection.toggleAll(e.target.checked)}
      className="size-4 accent-[var(--primary)]"
    />
  );
}

/** 행 선택 체크박스 */
export function RowCheckbox({ id, label }: { id: number; label: string }) {
  return (
    <input
      type="checkbox"
      name="ids"
      value={id}
      aria-label={`${label} 선택`}
      className="size-4 accent-[var(--primary)]"
    />
  );
}
