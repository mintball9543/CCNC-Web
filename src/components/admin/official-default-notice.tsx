import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { Button } from "@/components/ui/button";
import type { OfficialDiff } from "@/lib/content/official-updates";
import { cn } from "@/lib/utils/cn";

/**
 * 도표·표 수정 화면 위 안내.
 * - 새 공식 자료가 코드에 들어왔으면(마지막 확인 이후 바뀜) 알림 + 비교표 + 바꾸기/알림 끄기
 * - 직접 고친 값(오래된 연도 삭제 등)이면 조용한 안내 + 접힌 비교표 + 되돌리기
 */
export function OfficialDefaultNotice({
  isNew,
  diff,
  resetAction,
  dismissAction,
  resetHidden,
  dismissHidden,
  source,
}: {
  isNew: boolean;
  diff: OfficialDiff;
  resetAction: (formData: FormData) => Promise<void>;
  dismissAction: (formData: FormData) => Promise<void>;
  resetHidden: Record<string, string>;
  dismissHidden: Record<string, string>;
  /** 공식 자료의 출처 */
  source?: string;
}) {
  const same = diff.changedRows === 0 && diff.fields.length === 0;
  if (same) {
    return (
      <p className="mb-6 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
        지금 값이 홈페이지에 넣어 둔 최신 공식 자료와 같습니다.
      </p>
    );
  }

  const resetForm = (variant: "primary" | "secondary", label: string) => (
    <form action={resetAction}>
      {Object.entries(resetHidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <ConfirmSubmitButton
        variant={variant}
        message="지금 저장된 값을 지우고 공식 자료로 바꿉니다. 직접 고친 내용(지운 연도 포함)도 공식 자료대로 돌아갑니다. 계속할까요?"
      >
        {label}
      </ConfirmSubmitButton>
    </form>
  );

  if (!isNew) {
    return (
      <details className="mb-6 rounded-xl bg-muted/60 px-4 py-3 text-sm">
        <summary className="cursor-pointer text-muted-foreground">
          직접 고친 값을 쓰고 있습니다 (공식 자료와 {summaryText(diff)}). 비교 보기
        </summary>
        <div className="mt-3 space-y-3">
          <DiffView diff={diff} />
          <div className="flex justify-end">{resetForm("secondary", "공식 값으로 되돌리기")}</div>
        </div>
      </details>
    );
  }

  return (
    <section
      aria-labelledby="official-update-heading"
      className="mb-6 space-y-4 rounded-xl border border-primary/40 bg-primary-soft px-4 py-4 text-sm"
    >
      <div className="leading-relaxed">
        <p id="official-update-heading" className="font-semibold">
          새 공식 자료가 들어왔습니다 ({summaryText(diff)})
        </p>
        <p className="mt-0.5 text-muted-foreground">
          {source ? `공식 자료: ${source}. ` : ""}아래 비교표에서 달라진 칸을 확인하고 바꿀지
          정하세요.
        </p>
      </div>
      <DiffView diff={diff} />
      <div className="flex flex-wrap justify-end gap-2">
        <form action={dismissAction}>
          {Object.entries(dismissHidden).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <Button type="submit" variant="secondary">
            지금 값 유지 (알림 끄기)
          </Button>
        </form>
        {resetForm("primary", "새 공식 값으로 바꾸기")}
      </div>
    </section>
  );
}

function summaryText(diff: OfficialDiff): string {
  const count = (s: string) => diff.rows.filter((r) => r.status === s).length;
  const parts = [
    count("officialOnly") && `공식 자료에만 있는 항목 ${count("officialOnly")}개`,
    count("changed") && `값이 다른 항목 ${count("changed")}개`,
    count("savedOnly") && `지금 값에만 있는 항목 ${count("savedOnly")}개`,
    diff.fields.length && `글자 ${diff.fields.length}곳 다름`,
  ].filter(Boolean);
  return parts.join(", ");
}

const STATUS_LABEL = {
  same: "",
  changed: "값 다름",
  officialOnly: "공식 자료에만",
  savedOnly: "지금 값에만",
} as const;

function DiffView({ diff }: { diff: OfficialDiff }) {
  const rows = diff.rows.filter((r) => r.status !== "same");
  return (
    <div className="space-y-3">
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[480px] text-xs">
            <caption className="sr-only">지금 값과 공식 자료 비교 (달라진 항목만)</caption>
            <thead className="border-b border-border bg-muted/60 text-left">
              <tr>
                <th scope="col" className="px-3 py-2">
                  항목
                </th>
                {diff.columns.map((c) => (
                  <th key={c} scope="col" className="px-3 py-2 text-right">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border align-top last:border-0">
                  <th scope="row" className="px-3 py-2 text-left font-medium whitespace-nowrap">
                    {row.label}
                    <span
                      className={cn(
                        "ml-1.5 rounded px-1.5 py-0.5 text-[11px] font-semibold",
                        row.status === "officialOnly" && "bg-primary-soft text-primary",
                        row.status === "changed" && "bg-muted text-foreground",
                        row.status === "savedOnly" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {STATUS_LABEL[row.status]}
                    </span>
                  </th>
                  {row.cells.map((cell, i) => (
                    <td key={diff.columns[i]} className="px-3 py-2 text-right whitespace-nowrap">
                      {!cell.changed ? (
                        <span className="text-muted-foreground">{cell.saved || "–"}</span>
                      ) : (
                        <span className="inline-flex flex-col items-end">
                          <span className="text-muted-foreground line-through">
                            {cell.saved || "–"}
                          </span>
                          <span className="font-semibold text-primary">{cell.official || "–"}</span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
            달라진 항목만 보여 줍니다. 위(취소선)는 지금 값, 아래(굵게)는 공식 자료 값입니다.
          </p>
        </div>
      )}
      {diff.fields.length > 0 && (
        <dl className="space-y-2 rounded-lg border border-border bg-card px-3 py-2 text-xs">
          {diff.fields.map((f) => (
            <div key={f.label}>
              <dt className="font-semibold">{f.label}</dt>
              <dd className="text-muted-foreground line-through">{f.saved || "(비어 있음)"}</dd>
              <dd className="text-primary">{f.official || "(비어 있음)"}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
