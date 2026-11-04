"use client";

import { FileText, GripVertical, Paperclip, Trash2, Upload } from "lucide-react";
import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { uploadFile } from "@/lib/uploads/client";
import { ATTACHMENT_TYPES, formatFileSize } from "@/lib/uploads/policy";
import { fileViewUrl } from "@/lib/uploads/url";
import { cn } from "@/lib/utils/cn";
import type { UploadedFile } from "@/types";

export interface AttachmentManagerHandle {
  addFiles: (files: File[]) => void;
}

/**
 * 게시글 첨부파일 칸 — PDF·HWP 등 업로드, 순서 변경, 삭제.
 * 저장 시 hidden input(attachmentIds)의 순서대로 게시글에 연결된다.
 */
export function AttachmentManager({
  initial,
  ref,
}: {
  initial: UploadedFile[];
  ref?: Ref<AttachmentManagerHandle>;
}) {
  const [items, setItems] = useState<UploadedFile[]>(initial);
  const [uploading, setUploading] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  async function addFiles(files: File[]) {
    setError(null);
    for (const file of files) {
      setUploading((u) => [...u, file.name]);
      try {
        const uploaded = await uploadFile(file, "attachment");
        setItems((list) => [...list, uploaded]);
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : "업로드 실패"}`);
      } finally {
        setUploading((u) => u.filter((n) => n !== file.name));
      }
    }
  }

  useImperativeHandle(ref, () => ({ addFiles: (files) => void addFiles(files) }));

  const move = (from: number, to: number) =>
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  return (
    <div className="space-y-2">
      <input type="hidden" name="attachmentIds" value={items.map((i) => i.id).join(",")} />
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDragOver(false);
          void addFiles(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition",
          dragOver ? "border-primary bg-primary-soft" : "border-border",
        )}
      >
        <Upload className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-muted-foreground">
          파일을 끌어다 놓거나{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-medium text-primary underline"
          >
            파일 선택
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, HWP, HWPX, 오피스 문서, ZIP 등 · 파일당 50MB 이하
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept={Object.keys(ATTACHMENT_TYPES)
            .map((ext) => `.${ext}`)
            .join(",")}
          onChange={(e) => {
            void addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      {(items.length > 0 || uploading.length > 0) && (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((item, index) => (
            <li
              key={item.id}
              draggable
              onDragStart={() => (dragIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                if (dragIndex.current === null) return;
                e.preventDefault();
                move(dragIndex.current, index);
                dragIndex.current = null;
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm"
            >
              <GripVertical className="size-4 cursor-grab text-muted-foreground" aria-hidden />
              <FileText className="size-4 shrink-0 text-primary" aria-hidden />
              <a
                href={fileViewUrl(item.id)}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate hover:underline"
              >
                {item.originalName}
              </a>
              <span className="text-xs text-muted-foreground">{formatFileSize(item.size)}</span>
              <button
                type="button"
                onClick={() => setItems((list) => list.filter((i) => i.id !== item.id))}
                className="rounded p-1 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                aria-label={`${item.originalName} 삭제`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
          {uploading.map((name) => (
            <li
              key={name}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"
            >
              <Paperclip className="size-4 animate-pulse" aria-hidden />
              {name} 업로드 중…
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
