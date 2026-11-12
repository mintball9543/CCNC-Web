import Link from "next/link";
import { MessageCircleMore } from "lucide-react";

/**
 * 화면 오른쪽 아래에 항상 떠 있는 '문의하기' 말풍선 버튼.
 * 위아래로 천천히 떠다니고 주변으로 물결이 퍼진다. 움직임 줄이기 설정 사용자에게는 정지 상태로 표시.
 */
export function InquiryFab() {
  return (
    <Link
      href="/news/inquiry"
      aria-label="문의하기"
      className="group fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6 print:hidden"
    >
      <span className="relative block motion-safe:animate-fab-float">
        <span
          className="absolute inset-0 rounded-full bg-primary motion-safe:animate-fab-ring"
          aria-hidden
        />
        <span className="relative flex size-16 flex-col items-center justify-center gap-0.5 rounded-full rounded-br-md bg-primary text-primary-foreground shadow-lg ring-4 ring-background/70 transition group-hover:scale-105 group-hover:bg-primary-hover group-focus-visible:scale-105">
          <MessageCircleMore className="size-6" aria-hidden />
          <span className="text-[11px] leading-none font-semibold" aria-hidden>
            문의하기
          </span>
        </span>
      </span>
    </Link>
  );
}
