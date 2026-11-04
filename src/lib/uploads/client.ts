import type { UploadedFile } from "@/types";
import type { UploadKind } from "./policy";

/** 브라우저 → 관리자 업로드 API */
export async function uploadFile(file: File, kind: UploadKind): Promise<UploadedFile> {
  const body = new FormData();
  body.append("file", file);
  body.append("kind", kind);
  const response = await fetch("/api/admin/uploads", { method: "POST", body });
  const json = (await response.json().catch(() => ({}))) as Partial<UploadedFile> & {
    error?: string;
  };
  if (!response.ok) throw new Error(json.error ?? `업로드 실패 (${response.status})`);
  return json as UploadedFile;
}

const IMAGE_URL = /^https?:\/\/\S+\.(png|jpe?g|gif|webp|avif)(\?\S*)?$/i;

/** 붙여넣은 텍스트가 이미지 주소인지 확인 (확장자 → 실제 로드 순으로 판단) */
export async function isImageUrl(text: string, timeoutMs = 4000): Promise<boolean> {
  if (!/^https?:\/\/\S+$/i.test(text)) return false;
  if (IMAGE_URL.test(text)) return true;
  return new Promise((resolve) => {
    const img = new Image();
    const timer = window.setTimeout(() => resolve(false), timeoutMs);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img.naturalWidth > 0);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(false);
    };
    img.src = text;
  });
}

export const isImageFile = (file: File) => /^image\/(png|jpe?g|gif|webp)$/.test(file.type);
