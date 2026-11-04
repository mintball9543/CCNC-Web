import { getSession } from "@/lib/auth/session";
import * as fileRepository from "@/lib/repositories/file.repository";
import { checkUpload, type UploadKind } from "@/lib/uploads/policy";
import { saveUpload } from "@/lib/uploads/storage";
import { fileUrl } from "@/lib/uploads/url";
import type { UploadedFile } from "@/types";

/**
 * 관리자 파일 업로드 (본문 이미지 · 첨부파일 · 메인 비주얼)
 * multipart/form-data: file, kind("image" | "attachment")
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "업로드 요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const file = formData.get("file");
  const kind: UploadKind = formData.get("kind") === "attachment" ? "attachment" : "image";
  if (!(file instanceof File)) return Response.json({ error: "파일이 없습니다." }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const check = checkUpload(file.name, file.size, bytes.subarray(0, 4096), kind);
  if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

  const storageKey = await saveUpload(bytes, check.extension);
  const row = await fileRepository.insertFile({
    storageKey,
    originalName: file.name.normalize("NFC").slice(0, 200),
    mimeType: check.mime,
    size: file.size,
    kind,
  });

  const body: UploadedFile = {
    id: row.id,
    url: fileUrl(row.id),
    originalName: row.originalName,
    mimeType: row.mimeType,
    size: row.size,
    kind: row.kind,
  };
  return Response.json(body, { status: 201 });
}
