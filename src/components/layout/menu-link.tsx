import Link from "next/link";
import type { ReactNode } from "react";
import { isVisibleHref } from "@/lib/config/menu-visibility";
import { mainNavigation } from "@/lib/config/navigation";
import { getVisibleNavigation } from "@/lib/queries/site";

/**
 * 본문 속 메뉴 페이지 링크 — 관리자가 그 메뉴를 숨기면 링크 없이 글자만 남긴다(404 링크 방지).
 */
export async function MenuLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const navigation = await getVisibleNavigation();
  if (!isVisibleHref(href, navigation, mainNavigation))
    return <span className={className}>{children}</span>;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
