"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadFile } from "@/lib/uploads/client";
import { cn } from "@/lib/utils/cn";

/** 이미지 1장 업로드 필드 (끌어다 놓기 지원) — 업로드된 URL 을 hidden input 으로 전송 */
export function ImageUploadField({
  name,
  defaultValue,
  invalid,
}: {
  name: string;
  defaultValue?: string;
  invalid?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setUrl((await uploadFile(file, "image")).url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handle(e.dataTransfer.files[0]);
        }}
        className={cn(
          "relative flex aspect-[16/7] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted text-sm text-muted-foreground transition hover:border-primary",
          invalid ? "border-danger" : "border-border",
        )}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="선택한 이미지 미리보기"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <span className="flex flex-col items-center gap-2">
            <ImagePlus className="size-6" aria-hidden />
            사진을 끌어다 놓거나 눌러서 선택 (JPG·PNG·WEBP, 10MB 이하)
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
            <Loader2 className="size-6 animate-spin" aria-label="업로드 중" />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => {
          void handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
