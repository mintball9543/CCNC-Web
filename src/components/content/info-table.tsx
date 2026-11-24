import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { InfoCell, InfoTableData } from "@/lib/content/carbon-info";

const cellOf = (c: InfoCell) => (typeof c === "string" ? { text: c } : c);

/** 줄바꿈(\n)을 <br /> 로 바꿔 보여 준다 */
function Multiline({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}

/**
 * 콘텐츠용 표 (기존 홈페이지의 이미지·HTML 표를 데이터로 옮긴 것).
 * - 셀 병합(rowSpan·colSpan), 행 머리글(rowHeader), 줄바꿈 지원
 * - 좁은 화면에서는 가로 스크롤
 */
export function InfoTable({
  table,
  className,
  footnote,
}: {
  table: InfoTableData;
  className?: string;
  footnote?: ReactNode;
}) {
  const rowHeaderCols = table.rowHeaderCols ?? 1;
  return (
    <div className={cn("space-y-2", className)}>
      {table.unit && (
        <p className="text-right text-xs text-muted-foreground">(단위: {table.unit})</p>
      )}
      <div className="overflow-x-auto border-t-2 border-foreground">
        <table className={cn("w-full text-sm", table.minWidth ?? "min-w-[560px]")}>
          <caption className="sr-only">
            {table.caption}
            {table.unit && ` (단위: ${table.unit})`}
          </caption>
          <thead className="border-b border-border bg-muted/60">
            {table.head.map((row, r) => (
              <tr key={r}>
                {row.map((c, i) => {
                  const cell = cellOf(c);
                  return (
                    <th
                      key={i}
                      scope="col"
                      colSpan={cell.colSpan}
                      rowSpan={cell.rowSpan}
                      className="border-l border-border px-3 py-3 font-semibold"
                    >
                      <Multiline text={cell.text} />
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.rows.map((row, r) => {
              return (
                <tr key={r} className="border-b border-border">
                  {row.map((c, i) => {
                    const cell = cellOf(c);
                    // rowSpan 으로 앞 열이 이어지는 행은 셀에 th 를 직접 지정한다
                    const isHeader = cell.th ?? i < rowHeaderCols;
                    const Tag = isHeader ? "th" : "td";
                    return (
                      <Tag
                        key={i}
                        scope={isHeader ? "row" : undefined}
                        colSpan={cell.colSpan}
                        rowSpan={cell.rowSpan}
                        className={cn(
                          "border-l border-border px-3 py-2.5 align-middle leading-relaxed",
                          isHeader ? "bg-muted/30 font-medium" : "",
                          cell.align === "left"
                            ? "text-left"
                            : cell.align === "right"
                              ? "text-right tabular-nums"
                              : "text-center",
                          cell.emphasis && "font-semibold text-primary",
                        )}
                      >
                        <Multiline text={cell.text} />
                      </Tag>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(table.notes?.length || table.source || footnote) && (
        <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
          {table.notes?.map((n) => (
            <p key={n}>{n}</p>
          ))}
          {footnote}
          {table.source && <p>자료: {table.source}</p>}
        </div>
      )}
    </div>
  );
}
