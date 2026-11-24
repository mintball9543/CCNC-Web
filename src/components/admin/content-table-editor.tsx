"use client";

import { ClipboardPaste, Plus, Trash2 } from "lucide-react";
import { useActionState, useState, type ComponentProps } from "react";
import { InfoTable } from "@/components/content/info-table";
import { ActionForm } from "@/components/ui/action-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Fresh } from "@/components/ui/fresh";
import { SubmitButton } from "@/components/ui/submit-button";
import { parseClipboardTable } from "@/lib/charts/scale";
import type { ContentTableConfig } from "@/lib/config/charts";
import { toInfoTable } from "@/lib/content/content-tables";
import {
  initialActionState,
  type ActionState,
  type ContentTable,
  type ContentTableRow,
} from "@/types";

const STYLE_LABELS: Record<ContentTableRow["style"], string> = {
  "": "보통",
  header: "항목명 강조",
  row: "행 전체 강조",
};

/**
 * 홈페이지 글자 표 편집기 — 칸을 고치면 아래 미리보기가 바로 바뀐다.
 * 새 연도는 '열 추가', 새 항목은 '행 추가'. 엑셀에서 복사한 표를 그대로 붙여넣을 수도 있다.
 */
function ContentTableEditorInner({
  table,
  config,
  action: saveAction,
}: {
  table: ContentTable;
  config: ContentTableConfig;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  updatedAt?: number;
}) {
  const [state, action] = useActionState(saveAction, initialActionState);
  const v = state.values;
  const err = (k: string) => state.fieldErrors?.[k];
  const [caption, setCaption] = useState(v?.caption ?? table.caption);
  const [unit, setUnit] = useState(v?.unit ?? table.unit);
  const [notes, setNotes] = useState(v?.notes ?? table.notes);
  const [source, setSource] = useState(v?.source ?? table.source);
  const [head, setHead] = useState<string[]>(table.head);
  const [rows, setRows] = useState<ContentTableRow[]>(table.rows);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const setCell = (r: number, c: number, value: string) =>
    setRows((list) =>
      list.map((row, i) =>
        i === r ? { ...row, cells: row.cells.map((x, j) => (j === c ? value : x)) } : row,
      ),
    );
  const addColumn = () => {
    if (head.length >= 12) return;
    setHead((h) => [...h, ""]);
    setRows((list) => list.map((row) => ({ ...row, cells: [...row.cells, ""] })));
  };
  const removeColumn = (index: number) => {
    if (head.length <= 2) return;
    setHead((h) => h.filter((_, i) => i !== index));
    setRows((list) =>
      list.map((row) => ({ ...row, cells: row.cells.filter((_, i) => i !== index) })),
    );
  };
  const applyPaste = () => {
    const pasted = parseClipboardTable(pasteText);
    if (pasted.length < 2 || pasted[0].length < 2) return;
    const width = Math.min(pasted[0].length, 12);
    const fit = (line: string[]) => Array.from({ length: width }, (_, i) => line[i] ?? "");
    setHead(fit(pasted[0]));
    setRows(pasted.slice(1).map((line) => ({ cells: fit(line), style: "" })));
    setPasteOpen(false);
    setPasteText("");
  };

  const cleanRows = rows.filter((r) => r.cells.some((c) => c.trim() !== ""));
  const preview = toInfoTable({ ...table, caption, unit, notes, source, head, rows: cleanRows });

  return (
    <ActionForm action={action} className="space-y-6">
      <input type="hidden" name="head" value={JSON.stringify(head)} />
      <input type="hidden" name="rows" value={JSON.stringify(cleanRows)} />
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}
      <Alert tone="info">
        <p className="font-semibold">쓰이는 곳: {config.usedIn}</p>
        <p className="mt-1">{config.guide}</p>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="소제목" htmlFor="title" required errors={err("title")}>
          <Input id="title" name="title" defaultValue={v?.title ?? table.title} required />
        </Field>
        <Field label="표 제목" htmlFor="caption" required errors={err("caption")}>
          <Input
            id="caption"
            name="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
          />
        </Field>
      </div>
      <Field
        label="설명"
        htmlFor="description"
        errors={err("description")}
        hint="표 위에 문장으로 나옵니다. 비우면 나오지 않습니다."
      >
        <Input
          id="description"
          name="description"
          defaultValue={v?.description ?? table.description}
        />
      </Field>
      <Field label="단위" htmlFor="unit" errors={err("unit")} className="max-w-xs">
        <Input id="unit" name="unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
      </Field>

      <fieldset className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <legend className="text-sm font-medium">표 내용</legend>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setPasteOpen((o) => !o)}>
              <ClipboardPaste className="size-4" aria-hidden />
              엑셀에서 붙여넣기
            </Button>
            <Button size="sm" variant="secondary" onClick={addColumn} disabled={head.length >= 12}>
              <Plus className="size-4" aria-hidden />열 추가
            </Button>
          </div>
        </div>
        {pasteOpen && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              엑셀에서 첫 행(머리글)을 포함해 표를 복사한 뒤 붙여넣으세요. 표 내용 전체가 바뀝니다.
            </p>
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={5}
              className="min-h-24 font-mono text-xs"
              aria-label="붙여넣을 표"
            />
            <Button size="sm" onClick={applyPaste}>
              표에 적용
            </Button>
          </div>
        )}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                {head.map((name, i) => (
                  <th key={i} scope="col" className="px-1 py-1.5">
                    <div className="flex items-center gap-1">
                      <Input
                        value={name}
                        onChange={(e) =>
                          setHead((h) => h.map((x, j) => (j === i ? e.target.value : x)))
                        }
                        aria-label={`${i + 1}번째 머리글`}
                        className="h-8 min-w-24 font-medium"
                      />
                      {i > 0 && head.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(i)}
                          className="rounded p-1 text-muted-foreground hover:text-danger"
                          aria-label={`${name || i + 1} 열 삭제`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th scope="col" className="px-2 text-left text-xs font-medium whitespace-nowrap">
                  강조
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r} className="border-t border-border">
                  {row.cells.map((cell, c) => (
                    <td key={c} className="px-1 py-1">
                      <Input
                        value={cell}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        aria-label={`${row.cells[0] || r + 1} ${head[c]}`}
                        className="h-8 min-w-24"
                      />
                    </td>
                  ))}
                  <td className="px-1 py-1">
                    <Select
                      value={row.style}
                      onChange={(e) =>
                        setRows((list) =>
                          list.map((x, i) =>
                            i === r
                              ? { ...x, style: e.target.value as ContentTableRow["style"] }
                              : x,
                          ),
                        )
                      }
                      aria-label={`${row.cells[0] || r + 1} 행 강조`}
                      className="h-8 min-w-28"
                    >
                      {Object.entries(STYLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-1">
                    <button
                      type="button"
                      onClick={() => setRows((list) => list.filter((_, i) => i !== r))}
                      className="rounded p-1 text-muted-foreground hover:text-danger"
                      aria-label={`${r + 1}행 삭제`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setRows((list) => [...list, { cells: head.map(() => ""), style: "" }])}
        >
          <Plus className="size-4" aria-hidden />행 추가
        </Button>
        {(err("rows") ?? err("head"))?.map((e) => (
          <p key={e} className="text-xs text-danger">
            {e}
          </p>
        ))}
      </fieldset>

      <Field
        label="주석"
        htmlFor="notes"
        errors={err("notes")}
        hint="표 아래 작은 글씨로 나옵니다. 줄마다 한 문단입니다."
      >
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <Field label="출처" htmlFor="source" errors={err("source")} hint="공식 자료만">
        <Input
          id="source"
          name="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </Field>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-3 text-sm font-semibold text-muted-foreground">미리보기</p>
        <InfoTable table={preview} />
      </div>

      <div className="flex gap-2 border-t border-border pt-5">
        <SubmitButton pendingText="저장 중…">저장</SubmitButton>
        <ButtonLink href="/admin/charts" variant="secondary">
          취소
        </ButtonLink>
      </div>
    </ActionForm>
  );
}

export function ContentTableEditor(props: ComponentProps<typeof ContentTableEditorInner>) {
  return (
    <Fresh dataKey={props.updatedAt}>
      <ContentTableEditorInner {...props} />
    </Fresh>
  );
}
