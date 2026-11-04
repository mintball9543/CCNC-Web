import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Download } from "lucide-react";
import { HwpViewer } from "@/components/files/hwp-viewer";
import { Skeleton } from "@/components/ui/feedback";
import { getFileMeta } from "@/lib/queries/files";
import { formatFileSize, getExtension } from "@/lib/uploads/policy";
import { fileDownloadUrl, fileUrl } from "@/lib/uploads/url";

type Props = PageProps<"/files/[id]/view">;

async function load(params: Props["params"]) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return null;
  return getFileMeta(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const file = await load(params);
  return {
    title: file ? `${file.originalName} 미리보기` : "파일 미리보기",
    robots: { index: false },
  };
}

/** 첨부파일 미리보기 (새 탭) — PDF·이미지·텍스트는 브라우저 기본 뷰어, HWP 는 hwp.js 로 렌더링 */
export default function FileViewPage(props: Props) {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-[80vh]" />}>
      <FileView {...props} />
    </Suspense>
  );
}

async function FileView({ params }: Props) {
  const file = await load(params);
  if (!file) notFound();
  const ext = getExtension(file.originalName);
  const src = fileUrl(file.id);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate font-semibold">{file.originalName}</h1>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
        <a
          href={fileDownloadUrl(file.id)}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <Download className="size-4" aria-hidden />
          다운로드
        </a>
      </header>
      <main className="flex flex-1 flex-col bg-muted">
        {ext === "pdf" || ext === "txt" ? (
          <iframe
            src={src}
            title={file.originalName}
            className="min-h-[calc(100vh-4rem)] w-full flex-1 bg-white"
          />
        ) : file.mimeType.startsWith("image/") ? (
          <div className="flex flex-1 items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={file.originalName}
              className="max-h-[85vh] max-w-full rounded shadow"
            />
          </div>
        ) : ext === "hwp" ? (
          <HwpViewer src={src} downloadUrl={fileDownloadUrl(file.id)} />
        ) : (
          <p className="m-auto p-8 text-center text-muted-foreground">
            이 형식은 브라우저 미리보기를 지원하지 않습니다. 다운로드하여 확인해 주세요.
          </p>
        )}
      </main>
    </div>
  );
}
