"use client";

import { Fresh } from "@/components/ui/fresh";
import type { ComponentProps } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { ClipboardPaste, Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { DataChart } from "@/components/charts/data-chart";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveChartAction } from "@/lib/actions/content.actions";
import { MAX_SERIES } from "@/lib/charts/limits";
import { CHART_PLACEMENTS, chartPlacementOf } from "@/lib/config/charts";
import { parseClipboardTable, parseNumber } from "@/lib/charts/scale";
import { initialActionState, type ChartDataset, type ChartRow, type ChartType } from "@/types";

interface GridRow {
  label: string;
  cells: string[];
}

const toGrid = (rows: ChartRow[]): GridRow[] =>
  rows.map((r) => ({ label: r.label, cells: r.values.map((v) => (v === null ? "" : String(v))) }));

const fromGrid = (rows: GridRow[]): ChartRow[] =>
  rows
    .filter((r) => r.label.trim() !== "")
    .map((r) => ({ label: r.label.trim(), values: r.cells.map(parseNumber) }));

/**
 * 도표 편집기 — 표에 수치를 입력하면 오른쪽 미리보기가 바로 갱신된다.
 * 새 자료는 행만 추가하면 되고(가로축은 연도·지역 등 자유), 엑셀에서 복사한 표를 그대로 붙여넣을 수도 있다.
 */
/** 페이지별로 현재 표시 중인 도표 (키 → 도표) */
export type ChartPlacementHolders = Record<string, { id: number; title: string }>;

function ChartEditorInner({
  chart,
  holders = {},
}: {
  chart?: ChartDataset;
  holders?: ChartPlacementHolders;
}) {
  const [state, action] = useActionState(saveChartAction, initialActionState);
  const v = state.values;
  const [placement, setPlacement] = useState(
    v?.placement ?? (chart && chartPlacementOf(chart.slug) ? chart.slug : ""),
  );
  const otherHolder = placement ? holders[placement] : undefined;
  const replacing = otherHolder && otherHolder.id !== chart?.id ? otherHolder : null;
  const [title, setTitle] = useState(v?.title ?? chart?.title ?? "");
  const [unit, setUnit] = useState(v?.unit ?? chart?.unit ?? "");
  const [chartType, setChartType] = useState<ChartType>(
    (v?.chartType as ChartType) ?? chart?.chartType ?? "bar",
  );
  const [categoryLabel, setCategoryLabel] = useState(
    v?.categoryLabel ?? chart?.categoryLabel ?? "연도",
  );
  const [series, setSeries] = useState<string[]>(chart?.series ?? ["값"]);
  const [rows, setRows] = useState<GridRow[]>(() =>
    chart ? toGrid(chart.rows) : [{ label: "", cells: [""] }],
  );
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const err = (k: string) => state.fieldErrors?.[k];
  const checked = (k: "isPublished" | "showOnHome", fallback: boolean) =>
    v ? v[k] === "on" : fallback;

  const setCell = (r: number, c: number, value: string) =>
    setRows((list) =>
      list.map((row, i) =>
        i === r ? { ...row, cells: row.cells.map((x, j) => (j === c ? value : x)) } : row,
      ),
    );

  const addSeries = () => {
    if (series.length >= MAX_SERIES) return;
    setSeries((s) => [...s, `계열 ${s.length + 1}`]);
    setRows((list) => list.map((row) => ({ ...row, cells: [...row.cells, ""] })));
  };
  const removeSeries = (index: number) => {
    if (series.length <= 1) return;
    setSeries((s) => s.filter((_, i) => i !== index));
    setRows((list) =>
      list.map((row) => ({ ...row, cells: row.cells.filter((_, i) => i !== index) })),
    );
  };

  const applyPaste = () => {
    const table = parseClipboardTable(pasteText);
    if (table.length < 2 || table[0].length < 2) return;
    const header = table[0].slice(1, MAX_SERIES + 1);
    setCategoryLabel(table[0][0] || categoryLabel);
    setSeries(header);
    setRows(
      table
        .slice(1)
        .map((line) => ({ label: line[0] ?? "", cells: header.map((_, i) => line[i + 1] ?? "") })),
    );
    setPasteOpen(false);
    setPasteText("");
  };

  const dataRows = fromGrid(rows);

  return (
    <ActionForm action={action} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        {chart && <input type="hidden" name="id" value={chart.id} />}
        <input type="hidden" name="series" value={JSON.stringify(series)} />
        <input type="hidden" name="rows" value={JSON.stringify(dataRows)} />
        <input type="hidden" name="chartType" value={chartType} />
        {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

        <Field label="제목" htmlFor="title" required errors={err("title")}>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Field>
        <Field label="설명" htmlFor="description" errors={err("description")}>
          <Input
            id="description"
            name="description"
            defaultValue={v?.description ?? chart?.description}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="도표 종류" htmlFor="chartTypeSelect">
            <Select
              id="chartTypeSelect"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
            >
              <option value="bar">막대</option>
              <option value="stacked">누적 막대</option>
              <option value="line">선</option>
            </Select>
          </Field>
          <Field label="단위" htmlFor="unit" errors={err("unit")}>
            <Input
              id="unit"
              name="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="천 tCO₂eq"
            />
          </Field>
          <Field label="가로축 이름" htmlFor="categoryLabel">
            <Input
              id="categoryLabel"
              name="categoryLabel"
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value)}
            />
          </Field>
        </div>

        <fieldset className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <legend className="text-sm font-medium">데이터</legend>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setPasteOpen((o) => !o)}>
                <ClipboardPaste className="size-4" aria-hidden />
                엑셀에서 붙여넣기
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={addSeries}
                disabled={series.length >= MAX_SERIES}
              >
                <Plus className="size-4" aria-hidden />
                계열 추가
              </Button>
            </div>
          </div>
          {pasteOpen && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                엑셀에서 첫 행(제목 행)을 포함해 표를 복사한 뒤 붙여넣으세요. 첫 열은 가로축(연도
                등), 나머지 열은 계열입니다.
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
                  <th scope="col" className="w-28 px-2 py-2 text-left font-medium">
                    {categoryLabel}
                  </th>
                  {series.map((name, i) => (
                    <th key={i} scope="col" className="px-1 py-1.5">
                      <div className="flex items-center gap-1">
                        <span
                          className="size-2.5 shrink-0 rounded-sm"
                          style={{ background: `var(--series-${i + 1})` }}
                          aria-hidden
                        />
                        <Input
                          value={name}
                          onChange={(e) =>
                            setSeries((s) => s.map((x, j) => (j === i ? e.target.value : x)))
                          }
                          aria-label={`${i + 1}번째 계열 이름`}
                          className="h-8 min-w-24"
                        />
                        {series.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSeries(i)}
                            className="rounded p-1 text-muted-foreground hover:text-danger"
                            aria-label={`${name} 계열 삭제`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  <tr key={r} className="border-t border-border">
                    <td className="px-1 py-1">
                      <Input
                        value={row.label}
                        onChange={(e) =>
                          setRows((list) =>
                            list.map((x, i) => (i === r ? { ...x, label: e.target.value } : x)),
                          )
                        }
                        aria-label={`${r + 1}행 ${categoryLabel}`}
                        className="h-8"
                      />
                    </td>
                    {row.cells.map((cell, c) => (
                      <td key={c} className="px-1 py-1">
                        <Input
                          value={cell}
                          inputMode="decimal"
                          onChange={(e) => setCell(r, c, e.target.value)}
                          aria-label={`${row.label || r + 1} ${series[c]}`}
                          className="h-8 text-right tabular-nums"
                        />
                      </td>
                    ))}
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
            onClick={() => setRows((list) => [...list, { label: "", cells: series.map(() => "") }])}
          >
            <Plus className="size-4" aria-hidden />행 추가
          </Button>
          {(err("rows") ?? err("series"))?.map((e) => (
            <p key={e} className="text-xs text-danger">
              {e}
            </p>
          ))}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_6rem]">
          <Field
            label="출처"
            htmlFor="source"
            errors={err("source")}
            hint="공개 시 필수 (공식 자료만)"
          >
            <Input
              id="source"
              name="source"
              defaultValue={v?.source ?? chart?.source}
              placeholder="온실가스종합정보센터, 2023 지역별 인벤토리"
            />
          </Field>
          <Field label="출처 링크" htmlFor="sourceUrl" errors={err("sourceUrl")}>
            <Input
              id="sourceUrl"
              name="sourceUrl"
              defaultValue={v?.sourceUrl ?? chart?.sourceUrl ?? ""}
            />
          </Field>
          <Field label="순서" htmlFor="sortOrder" hint="메인 화면에서 작을수록 앞">
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={v?.sortOrder ?? chart?.sortOrder ?? 0}
            />
          </Field>
        </div>
        <fieldset className="space-y-4 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium">홈페이지 어디에 보일까요?</legend>
          <Field
            label="표시할 메뉴"
            htmlFor="placement"
            errors={err("placement")}
            hint="선택한 메뉴 화면에 이 도표가 나옵니다. 메뉴 하나에는 도표 하나만 넣을 수 있습니다."
          >
            <Select
              id="placement"
              name="placement"
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
            >
              <option value="">메뉴에 넣지 않음 (메인 화면에만 두거나 보관)</option>
              {CHART_PLACEMENTS.map((p) => {
                const holder = holders[p.slug];
                const note = holder && holder.id !== chart?.id ? ` — 지금: ${holder.title}` : "";
                return (
                  <option key={p.slug} value={p.slug}>
                    {p.label}
                    {note}
                  </option>
                );
              })}
            </Select>
          </Field>
          {replacing && (
            <Alert tone="info">
              지금 이 메뉴에는 &lsquo;{replacing.title}&rsquo; 도표가 나오고 있습니다. 저장하면 이
              도표로 바뀌고, 기존 도표는 &lsquo;메뉴에 넣지 않음&rsquo;으로 옮겨집니다(삭제되지
              않음).
            </Alert>
          )}
          <div className="flex flex-wrap gap-6">
            <Checkbox
              name="showOnHome"
              defaultChecked={checked("showOnHome", chart?.showOnHome ?? false)}
              label="메인 화면에도 표시"
            />
            <Checkbox
              name="isPublished"
              defaultChecked={checked("isPublished", chart?.isPublished ?? false)}
              label="공개 (체크하지 않으면 어디에도 보이지 않음)"
            />
          </div>
        </fieldset>
        <div className="flex gap-2 border-t border-border pt-5">
          <SubmitButton pendingText="저장 중…">{chart ? "수정" : "등록"}</SubmitButton>
          <ButtonLink href="/admin/charts" variant="secondary">
            취소
          </ButtonLink>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-1 text-sm font-semibold text-muted-foreground">미리보기</p>
          <p className="text-lg font-bold">{title || "제목"}</p>
          {dataRows.length > 0 ? (
            <DataChart
              data={{ title, unit, chartType, categoryLabel, series, rows: dataRows }}
              className="mt-4"
            />
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">
              데이터를 입력하면 도표가 표시됩니다.
            </p>
          )}
        </div>
      </div>
    </ActionForm>
  );
}

export function ChartEditor(props: ComponentProps<typeof ChartEditorInner>) {
  return (
    <Fresh dataKey={props.chart?.updatedAt?.getTime()}>
      <ChartEditorInner {...props} />
    </Fresh>
  );
}
