import { Download, Eye, FileText, Paperclip } from "lucide-react";
import { formatFileSize, isPreviewable } from "@/lib/uploads/policy";
import { fileDownloadUrl, fileViewUrl } from "@/lib/uploads/url";
import type { UploadedFile } from "@/types";

/** 게시글 첨부파일 — 미리보기(새 탭) · 다운로드 */
export function AttachmentList({ files }: { files: UploadedFile[] }) {
  if (files.length === 0) return null;
  return (
    <section
      aria-labelledby="attachments-heading"
      className="rounded-xl border border-border bg-muted/40 p-4"
    >
      <h3 id="attachments-heading" className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
        <Paperclip className="size-4" aria-hidden />
        첨부파일 <span className="text-muted-foreground">{files.length}</span>
      </h3>
      <ul className="space-y-2">
        {files.map((file) => (
          <li
            key={file.id}
            className="flex flex-wrap items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm"
          >
            <FileText className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{file.originalName}</span>
            <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
            <span className="flex gap-1">
              {isPreviewable(file.originalName) && (
                <a
                  href={fileViewUrl(file.id)}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                >
                  <Eye className="size-3.5" aria-hidden />
                  미리보기<span className="sr-only"> {file.originalName} (새 창)</span>
                </a>
              )}
              <a
                href={fileDownloadUrl(file.id)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
              >
                <Download className="size-3.5" aria-hidden />
                다운로드<span className="sr-only"> {file.originalName}</span>
              </a>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
