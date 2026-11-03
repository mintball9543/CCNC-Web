import { FileClock } from "lucide-react";
import type { ReactNode } from "react";

/**
 * 공식 자료 확정 전 콘텐츠 자리 표시.
 * ⚠️ 정보 신뢰성 원칙: 공식 기관 배포 자료로 확인된 내용만 게시한다. (ISSUES.md 참고)
 */
export function ContentPlaceholder({
  sections,
  issue,
  note,
}: {
  /** 이 페이지에 들어갈 예정인 구성 항목 */
  sections: string[];
  /** ISSUES.md 항목 번호 */
  issue?: string;
  note?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 rounded-xl border border-dashed border-border bg-muted/50 p-6">
        <FileClock className="size-6 shrink-0 text-primary" aria-hidden />
        <div className="space-y-1">
          <p className="font-semibold">콘텐츠 준비 중입니다.</p>
          <p className="text-sm text-muted-foreground">
            공식 자료 확인 후 게시될 예정입니다.
            {issue && <span className="ml-1 font-mono text-xs">[{issue}]</span>}
          </p>
          {note && <div className="pt-1 text-sm text-muted-foreground">{note}</div>}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">게시 예정 구성</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {sections.map((section) => (
            <li key={section} className="rounded-lg border border-border px-4 py-3 text-sm">
              {section}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
