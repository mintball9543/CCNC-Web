import type { MetadataRoute } from "next";
import { mainNavigation } from "@/lib/config/navigation";
import { siteConfig } from "@/lib/config/site";

/** 메뉴 설정 기반 sitemap.xml (게시글 상세는 추후 추가 — ISSUES.md) */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...mainNavigation.flatMap((s) => s.items.map((i) => i.href)), "/privacy"];
  return paths.map((path) => ({ url: `${siteConfig.url}${path}` }));
}
