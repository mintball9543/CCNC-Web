import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import * as fileRepository from "@/lib/repositories/file.repository";

/** 파일 미리보기 화면용 메타데이터 (파일 내용 접근 권한은 /files/[id] 라우트에서 검사) */
export async function getFileMeta(id: number) {
  "use cache";
  cacheLife("days");
  cacheTag(cacheTags.file(id));
  const file = await fileRepository.findFile(id);
  if (!file) return null;
  return { id: file.id, originalName: file.originalName, mimeType: file.mimeType, size: file.size };
}
