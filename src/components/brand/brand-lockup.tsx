import Image from "next/image";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

/**
 * 헤더용 CI — 심볼 이미지 + 기관명 텍스트.
 * 기관명을 이미지가 아닌 텍스트로 출력해 작은 크기에서도 선명하고, 다크모드에서 자동으로 색이 바뀐다.
 */
export function BrandLockup({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/brand/ccnc-symbol.png"
        alt=""
        width={992}
        height={992}
        priority
        className={cn("shrink-0", compact ? "size-9" : "size-11 lg:size-12")}
      />
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "font-semibold text-muted-foreground",
            compact ? "text-[11px]" : "text-xs lg:text-[13px]",
          )}
        >
          충청남도
        </span>
        <span
          className={cn(
            "font-extrabold tracking-tight text-foreground",
            compact ? "text-base" : "text-lg lg:text-xl",
          )}
        >
          탄소중립지원센터
        </span>
        {!compact && (
          <span className="hidden text-[9px] font-medium tracking-[0.08em] text-muted-foreground uppercase xl:block">
            {siteConfig.englishName}
          </span>
        )}
      </span>
    </span>
  );
}
