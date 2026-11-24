"use client";

import { Fresh } from "@/components/ui/fresh";
import type { ComponentProps } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { ClipboardPaste, Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { DataChart } from "@/components/charts/data-chart";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveChartAction } from "@/lib/actions/content.actions";
import { MAX_SERIES } from "@/lib/charts/limits";
import type { SystemChart } from "@/lib/config/charts";
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
 * 도표·자료 편집기 — 홈페이지에 들어간 도표·표의 수치를 고친다. 미리보기가 바로 갱신된다.
 * 새 연도는 행만 추가하면 되고, 엑셀에서 복사한 표를 그대로 붙여넣을 수도 있다.
 */
function ChartEditorInner({
  chart,
  system,
}: {
  chart: ChartDataset;
  /** 이 자료가 쓰이는 곳·안내, 계열 고정 여부 */
  system: SystemChart;
}) {
  const [state, action] = useActionState(saveChartAction, initialActionState);
  const v = state.values;
  const fixedSeries = !!system.fixedSeries;
  const [title, setTitle] = useState(v?.title ?? chart.title ?? "");
  const [unit, setUnit] = useState(v?.unit ?? chart.unit ?? "");
  const [chartType, setChartType] = useState<ChartType>(
    (v?.chartType as ChartType) ?? chart.chartType ?? "bar",
  );
  const [categoryLabel, setCategoryLabel] = useState(
    v?.categoryLabel ?? chart.categoryLabel ?? "연도",
  );
  const [series, setSeries] = useState<string[]>(chart.series);
  const [rows, setRows] = useState<GridRow[]>(() => toGrid(chart.rows));
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const err = (k: string) => state.fieldErrors?.[k];

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
    if (fixedSeries) {
      // 계열 고정 자료: 첫 행(제목 행)은 건너뛰고 값만 계열 순서대로 채운다
      setRows(
        table.slice(1).map((line) => ({
          label: line[0] ?? "",
          cells: series.map((_, i) => line[i + 1] ?? ""),
        })),
      );
      setPasteOpen(false);
      setPasteText("");
      return;
    }
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
  const previewCount = system.previewSeries ?? series.length;
  const preview = {
    title,
    unit,
    chartType,
    categoryLabel,
    series: series.slice(0, previewCount),
    rows: dataRows.map((r) => ({ ...r, values: r.values.slice(0, previewCount) })),
  };

  return (
    <ActionForm action={action} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <input type="hidden" name="id" value={chart.id} />
        <input type="hidden" name="series" value={JSON.stringify(series)} />
        <input type="hidden" name="rows" value={JSON.stringify(dataRows)} />
        <input type="hidden" name="chartType" value={chartType} />
        {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}
        {
          <Alert tone="info">
            <p className="font-semibold">홈페이지에 고정된 자료입니다.</p>
            <p className="mt-1">쓰이는 곳: {system.usedIn.join(" / ")}</p>
            <p className="mt-1">{system.guide}</p>
          </Alert>
        }

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
            defaultValue={v?.description ?? chart.description}
          />
        </Field>
        <Field
          label="주석"
          htmlFor="notes"
          errors={err("notes")}
          hint="도표 아래 작은 글씨로 나옵니다. 줄마다 한 문단입니다."
        >
          <Textarea id="notes" name="notes" rows={2} defaultValue={v?.notes ?? chart.notes ?? ""} />
        </Field>
        <div className={fixedSeries ? "grid gap-4 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-3"}>
          {!fixedSeries && (
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
          )}
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

        <fieldset className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <legend className="text-sm font-medium">데이터</legend>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setPasteOpen((o) => !o)}>
                <ClipboardPaste className="size-4" aria-hidden />
                엑셀에서 붙여넣기
              </Button>
              {!fixedSeries && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={addSeries}
                  disabled={series.length >= MAX_SERIES}
                >
                  <Plus className="size-4" aria-hidden />
                  계열 추가
                </Button>
              )}
            </div>
          </div>
          {pasteOpen && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                엑셀에서 첫 행(제목 행)을 포함해 표를 복사한 뒤 붙여넣으세요. 첫 열은 가로축(연도
                등), 나머지 열은 계열입니다.
                {fixedSeries &&
                  " 이 자료는 계열이 고정되어 있어 값만 위 표의 열 순서대로 채웁니다."}
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
                        {fixedSeries ? (
                          <span className="min-w-16 px-1 py-1.5 text-left text-xs font-medium">
                            {name}
                          </span>
                        ) : (
                          <Input
                            value={name}
                            onChange={(e) =>
                              setSeries((s) => s.map((x, j) => (j === i ? e.target.value : x)))
                            }
                            aria-label={`${i + 1}번째 계열 이름`}
                            className="h-8 min-w-24"
                          />
                        )}
                        {!fixedSeries && series.length > 1 && (
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
                        className="h-8 min-w-20"
                      />
                    </td>
                    {row.cells.map((cell, c) => (
                      <td key={c} className="px-1 py-1">
                        <Input
                          value={cell}
                          inputMode="decimal"
                          onChange={(e) => setCell(r, c, e.target.value)}
                          aria-label={`${row.label || r + 1} ${series[c]}`}
                          className="h-8 min-w-16 text-right tabular-nums"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="출처" htmlFor="source" errors={err("source")} hint="공식 자료만">
            <Input
              id="source"
              name="source"
              defaultValue={v?.source ?? chart.source}
              placeholder="온실가스종합정보센터, 2023 지역별 인벤토리"
            />
          </Field>
          <Field label="출처 링크" htmlFor="sourceUrl" errors={err("sourceUrl")}>
            <Input
              id="sourceUrl"
              name="sourceUrl"
              defaultValue={v?.sourceUrl ?? chart.sourceUrl ?? ""}
            />
          </Field>
        </div>
        <div className="flex gap-2 border-t border-border pt-5">
          <SubmitButton pendingText="저장 중…">저장</SubmitButton>
          <ButtonLink href="/admin/charts" variant="secondary">
            취소
          </ButtonLink>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-1 text-sm font-semibold text-muted-foreground">미리보기</p>
          <p className="text-lg font-bold">{title || "제목"}</p>
          {previewCount < series.length && (
            <p className="mt-1 text-xs text-muted-foreground">
              {series.slice(0, previewCount).join("·")} 부문만 그린 미리보기입니다.
            </p>
          )}
          {dataRows.length > 0 ? (
            <DataChart data={preview} className="mt-4" />
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
    <Fresh dataKey={props.chart.updatedAt?.getTime()}>
      <ChartEditorInner {...props} />
    </Fresh>
  );
}
