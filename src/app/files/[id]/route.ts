import { getSession } from "@/lib/auth/session";
import * as fileRepository from "@/lib/repositories/file.repository";
import { readUpload } from "@/lib/uploads/storage";

/**
 * 업로드 파일 제공.
 * - 기본: 이미지·PDF·텍스트는 브라우저에서 바로 열림(inline), 그 외는 다운로드
 * - ?download=1: 항상 다운로드
 * - 비공개 게시글의 첨부파일은 관리자만 접근 가능
 */
export async function GET(request: Request, { params }: RouteContext<"/files/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return new Response("Not Found", { status: 404 });

  const found = await fileRepository.findFileWithPostVisibility(id);
  if (!found) return new Response("Not Found", { status: 404 });
  const { file, isPublished } = found;

  if (isPublished === false && !(await getSession())) {
    return new Response("Not Found", { status: 404 });
  }

  let data: Buffer;
  try {
    data = await readUpload(file.storageKey);
  } catch {
    return new Response("Not Found", { status: 404 });
  }

  const download = new URL(request.url).searchParams.has("download");
  const inlineType = /^(image\/|application\/pdf|text\/plain)/.test(file.mimeType);
  const disposition = download || !inlineType ? "attachment" : "inline";
  const encodedName = encodeURIComponent(file.originalName);

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(data.byteLength),
      "Content-Disposition": `${disposition}; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
      "Cache-Control": isPublished === false ? "private, no-store" : "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
