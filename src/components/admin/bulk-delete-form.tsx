"use client";

import { Trash2 } from "lucide-react";
import {
  createContext,
  use,
  useCallback,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { rangeBetween } from "@/lib/utils/range-select";

interface BulkSelection {
  allChecked: boolean;
  toggleAll: (checked: boolean) => void;
}

const BulkSelectionContext = createContext<BulkSelection | null>(null);

/**
 * 관리자 목록 선택 삭제 폼.
 * - 목록의 체크박스(name="ids")를 선택한 뒤 '선택 삭제'를 누르면 확인 후 한 번에 삭제한다.
 * - 윈도우 탐색기처럼 한 행을 누른 뒤 Shift 를 누른 채 다른 행을 누르면 사이의 행이 모두 같은 상태가 된다.
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
  /** Shift 범위 선택의 기준 행 (마지막으로 Shift 없이 누른 행) */
  const anchorRef = useRef<number | null>(null);
  const [selection, setSelection] = useState({ count: 0, total: 0 });

  const boxes = useCallback(
    () =>
      Array.from(formRef.current?.querySelectorAll<HTMLInputElement>('input[name="ids"]') ?? []),
    [],
  );
  const refresh = useCallback(() => {
    const all = boxes();
    setSelection({ count: all.filter((b) => b.checked).length, total: all.length });
  }, [boxes]);

  const toggleAll = (checked: boolean) => {
    for (const box of boxes()) box.checked = checked;
    anchorRef.current = null;
    refresh();
  };

  const handleClick = (event: MouseEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.name !== "ids") return;
    const all = boxes();
    const index = all.indexOf(target);
    if (index < 0) return;
    const anchor = anchorRef.current;
    if (event.shiftKey && anchor !== null && anchor < all.length) {
      for (const i of rangeBetween(anchor, index)) all[i].checked = target.checked;
    } else {
      anchorRef.current = index;
    }
    refresh();
  };

  return (
    <BulkSelectionContext
      value={{ allChecked: selection.total > 0 && selection.count === selection.total, toggleAll }}
    >
      <form ref={formRef} action={action} onChange={refresh} onClick={handleClick}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {selection.count > 0
              ? `${selection.count}건 선택됨`
              : "삭제할 항목을 선택하세요. (Shift 를 누른 채 누르면 사이의 항목을 한 번에 선택)"}
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
    <label className="flex h-full cursor-pointer items-center justify-center py-1">
      <input
        type="checkbox"
        aria-label={label}
        checked={selection.allChecked}
        onChange={(e) => selection.toggleAll(e.target.checked)}
        className="size-4 cursor-pointer accent-[var(--primary)]"
      />
    </label>
  );
}

/** 행 선택 체크박스 — 칸 전체를 눌러도 선택된다 */
export function RowCheckbox({ id, label }: { id: number; label: string }) {
  return (
    <label
      className="flex cursor-pointer items-center justify-center px-1 py-3 select-none sm:py-5"
      // Shift+클릭 시 글자가 드래그 선택되지 않도록
      onMouseDown={(e) => {
        if (e.shiftKey) e.preventDefault();
      }}
    >
      <input
        type="checkbox"
        name="ids"
        value={id}
        aria-label={`${label} 선택`}
        className="size-4 cursor-pointer accent-[var(--primary)]"
      />
    </label>
  );
}
