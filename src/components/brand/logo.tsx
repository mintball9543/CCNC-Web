import Image from "next/image";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

/**
 * CI 로고 — 라이트/다크 모드별 이미지를 CSS(dark: variant)로 교체한다.
 * 숨겨진 쪽은 display:none 이므로 스크린리더에는 하나만 읽힌다.
 * JS 없이 동작하므로 테마 전환·초기 렌더 시 깜빡임이 없다.
 * 다크 변형은 scripts/make-dark-logos.py 로 생성 (워드마크만 밝은 색으로 치환, 심볼은 원본 유지).
 */
const variants = {
  horizontal: {
    light: "/brand/ccnc-logo-horizontal.webp",
    dark: "/brand/ccnc-logo-horizontal-dark.webp",
    width: 2000,
    height: 715,
  },
  vertical: {
    light: "/brand/ccnc-logo-vertical.png",
    dark: "/brand/ccnc-logo-vertical-dark.png",
    width: 1552,
    height: 1576,
  },
  symbol: {
    light: "/brand/ccnc-symbol.png",
    dark: "/brand/ccnc-symbol.png",
    width: 992,
    height: 992,
  },
} as const;

export type LogoVariant = keyof typeof variants;

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
  /** 장식용(옆에 기관명이 텍스트로 있는 경우) */
  decorative?: boolean;
}

export function Logo({ variant = "horizontal", className, priority, decorative }: LogoProps) {
  const v = variants[variant];
  const alt = decorative ? "" : siteConfig.name;
  const common = { width: v.width, height: v.height, priority };

  if (v.light === v.dark) {
    return <Image src={v.light} alt={alt} {...common} className={cn("h-auto w-auto", className)} />;
  }
  return (
    <>
      <Image
        src={v.light}
        alt={alt}
        {...common}
        className={cn("h-auto w-auto dark:hidden", className)}
      />
      <Image
        src={v.dark}
        alt={alt}
        {...common}
        className={cn("hidden h-auto w-auto dark:block", className)}
      />
    </>
  );
}
