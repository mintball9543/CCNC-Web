import type { Metadata } from "next";
import { findNavItem } from "@/lib/config/navigation";

/** 메뉴 설정에서 페이지 제목을 가져와 메타데이터 생성 (메뉴명 = 페이지 제목) */
export function navMetadata(href: string, description?: string): Metadata {
  const item = findNavItem(href);
  if (!item) throw new Error(`navigation 에 없는 경로입니다: ${href}`);
  return { title: item.title, description, alternates: { canonical: href } };
}
