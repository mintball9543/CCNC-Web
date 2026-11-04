/**
 * 업로드 허용 정책 — 확장자 + 파일 시그니처(매직 바이트) 이중 검사.
 * SVG·HTML 등 스크립트 실행 가능 형식은 허용하지 않는다.
 */
export type UploadKind = "image" | "attachment";

type Signature = "jpeg" | "png" | "gif" | "webp" | "pdf" | "cfb" | "zip" | "text";

interface TypeRule {
  mime: string;
  signature: Signature;
  /** 브라우저 탭에서 미리보기 지원 */
  previewable: boolean;
}

export const IMAGE_TYPES: Record<string, TypeRule> = {
  jpg: { mime: "image/jpeg", signature: "jpeg", previewable: true },
  jpeg: { mime: "image/jpeg", signature: "jpeg", previewable: true },
  png: { mime: "image/png", signature: "png", previewable: true },
  gif: { mime: "image/gif", signature: "gif", previewable: true },
  webp: { mime: "image/webp", signature: "webp", previewable: true },
};

export const ATTACHMENT_TYPES: Record<string, TypeRule> = {
  ...IMAGE_TYPES,
  pdf: { mime: "application/pdf", signature: "pdf", previewable: true },
  hwp: { mime: "application/x-hwp", signature: "cfb", previewable: true },
  hwpx: { mime: "application/hwp+zip", signature: "zip", previewable: false },
  doc: { mime: "application/msword", signature: "cfb", previewable: false },
  docx: {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    signature: "zip",
    previewable: false,
  },
  xls: { mime: "application/vnd.ms-excel", signature: "cfb", previewable: false },
  xlsx: {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    signature: "zip",
    previewable: false,
  },
  ppt: { mime: "application/vnd.ms-powerpoint", signature: "cfb", previewable: false },
  pptx: {
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    signature: "zip",
    previewable: false,
  },
  zip: { mime: "application/zip", signature: "zip", previewable: false },
  txt: { mime: "text/plain; charset=utf-8", signature: "text", previewable: true },
  csv: { mime: "text/csv; charset=utf-8", signature: "text", previewable: false },
};

export const MAX_UPLOAD_BYTES: Record<UploadKind, number> = {
  image: 10 * 1024 * 1024,
  attachment: 50 * 1024 * 1024,
};

export function getExtension(fileName: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(fileName.trim());
  return match ? match[1].toLowerCase() : "";
}

export function getTypeRule(fileName: string, kind: UploadKind): TypeRule | undefined {
  const table = kind === "image" ? IMAGE_TYPES : ATTACHMENT_TYPES;
  return table[getExtension(fileName)];
}

export function isPreviewable(fileName: string): boolean {
  return ATTACHMENT_TYPES[getExtension(fileName)]?.previewable ?? false;
}

const startsWith = (bytes: Uint8Array, sig: number[], offset = 0) =>
  sig.every((b, i) => bytes[offset + i] === b);

/** 파일 앞부분 바이트로 실제 형식 확인 */
export function matchesSignature(bytes: Uint8Array, signature: Signature): boolean {
  switch (signature) {
    case "jpeg":
      return startsWith(bytes, [0xff, 0xd8, 0xff]);
    case "png":
      return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "gif":
      return startsWith(bytes, [0x47, 0x49, 0x46, 0x38]);
    case "webp":
      return (
        startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
        startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
      );
    case "pdf":
      return startsWith(bytes, [0x25, 0x50, 0x44, 0x46]);
    case "cfb":
      return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    case "zip":
      return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]);
    case "text":
      // NUL 바이트가 없으면 텍스트로 간주
      return !bytes.subarray(0, 4096).includes(0);
  }
}

export type UploadCheck =
  { ok: true; mime: string; extension: string } | { ok: false; error: string };

export function checkUpload(
  fileName: string,
  size: number,
  head: Uint8Array,
  kind: UploadKind,
): UploadCheck {
  const extension = getExtension(fileName);
  const rule = getTypeRule(fileName, kind);
  if (!rule) {
    const allowed = Object.keys(kind === "image" ? IMAGE_TYPES : ATTACHMENT_TYPES).join(", ");
    return { ok: false, error: `허용되지 않는 파일 형식입니다. (허용: ${allowed})` };
  }
  if (size === 0) return { ok: false, error: "빈 파일은 올릴 수 없습니다." };
  if (size > MAX_UPLOAD_BYTES[kind]) {
    return {
      ok: false,
      error: `파일 크기는 ${MAX_UPLOAD_BYTES[kind] / 1024 / 1024}MB 이하여야 합니다.`,
    };
  }
  if (!matchesSignature(head, rule.signature)) {
    return { ok: false, error: "파일 내용이 확장자와 일치하지 않습니다." };
  }
  return { ok: true, mime: rule.mime, extension };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
