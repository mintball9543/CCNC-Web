"use client";

import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";

/**
 * 페이지 상태 보존(Activity) 해제용 래퍼.
 *
 * Next.js 16(Cache Components)은 이동한 페이지를 언마운트하지 않고 숨겨 두었다가 다시 보여 준다.
 * 그래서 수정 후 목록으로 갔다가 같은 항목을 다시 열면 이전 입력 상태가 그대로 보였다.
 * - 링크 클릭 등으로 새로 들어오면(bfcacheId 변경) 폼을 새로 그린다. (브라우저 뒤로/앞으로는 작성 중 내용 유지)
 * - dataKey(예: 수정 시각)가 바뀌면 최신 데이터로 다시 그린다.
 */
export function Fresh({
  dataKey,
  children,
}: {
  dataKey?: string | number | null;
  children: ReactNode;
}) {
  const { bfcacheId } = useRouter();
  return <Fragment key={`${bfcacheId}:${dataKey ?? ""}`}>{children}</Fragment>;
}
