import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import * as popupRepository from "@/lib/repositories/popup.repository";

/** 메인 화면 활성 팝업 (게시 기간은 클라이언트에서 현재 시각 기준 필터링) */
export async function getActivePopups() {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.popups);
  return popupRepository.listActivePopups();
}
