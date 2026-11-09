import Link from "next/link";
import { PenLine } from "lucide-react";
import { Suspense } from "react";
import { BoardSkeleton } from "@/components/board/board-skeleton";
import { InquiryTable } from "@/components/inquiry/inquiry-table";
import { ButtonLink } from "@/components/ui/button";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
import { getMyInquiries, getPublicInquiries } from "@/lib/queries/inquiries";
import { navMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils/cn";

export const metadata = navMetadata("/news/inquiry");

export default function InquiryListPage(props: PageProps<"/news/inquiry">) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          센터 사업 및 탄소중립 관련 문의를 남겨주시면 담당자가 답변드립니다.
        </p>
        <ButtonLink href="/news/inquiry/new" className="shrink-0">
          <PenLine className="size-4" aria-hidden />
          문의하기
        </ButtonLink>
      </div>
      <Suspense fallback={<BoardSkeleton />}>
        <InquiryList {...props} />
      </Suspense>
    </>
  );
}

async function InquiryList({ searchParams }: PageProps<"/news/inquiry">) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const mine = sp.mine === "1";
  const base = mine ? "/news/inquiry?mine=1" : "/news/inquiry";
  const pageHref = (p: number) => (p > 1 ? `${base}${mine ? "&" : "?"}page=${p}` : base);

  return (
    <>
      {sp.deleted === "1" && (
        <Alert tone="success" className="mb-4">
          문의를 삭제했습니다.
        </Alert>
      )}
      <MineToggle mine={mine} />
      {mine ? (
        <MyInquiryList page={page} pageHref={pageHref} />
      ) : (
        <AllInquiryList page={page} pageHref={pageHref} />
      )}
    </>
  );
}

/** '본인 글 보기' 토글 — URL(?mine=1)로 상태를 표현해 뒤로 가기·새로고침에도 유지 */
function MineToggle({ mine }: { mine: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-end gap-3">
      <span id="mine-toggle-label" className="text-sm font-medium">
        본인 글 보기
      </span>
      <Link
        href={mine ? "/news/inquiry" : "/news/inquiry?mine=1"}
        role="switch"
        aria-checked={mine}
        aria-labelledby="mine-toggle-label"
        scroll={false}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition",
          mine ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
            mine ? "left-5.5" : "left-0.5",
          )}
        />
      </Link>
    </div>
  );
}

async function AllInquiryList({
  page,
  pageHref,
}: {
  page: number;
  pageHref: (p: number) => string;
}) {
  const result = await getPublicInquiries(page);
  return (
    <>
      <InquiryTable
        items={result.items}
        startNumber={result.total - (result.page - 1) * result.pageSize}
        hrefFor={(item) => `/news/inquiry/${item.id}`}
      />
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={pageHref} />
    </>
  );
}

async function MyInquiryList({
  page,
  pageHref,
}: {
  page: number;
  pageHref: (p: number) => string;
}) {
  const result = await getMyInquiries(page);
  if (!result || result.total === 0) {
    return (
      <EmptyState
        title="이 브라우저에서 작성한 문의가 없습니다."
        description="본인 글은 문의를 작성한 브라우저(기기)에서만 모아 볼 수 있습니다."
      />
    );
  }
  return (
    <>
      <InquiryTable
        items={result.items}
        startNumber={result.total - (result.page - 1) * result.pageSize}
        hrefFor={(item) => `/news/inquiry/${item.id}`}
      />
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={pageHref} />
    </>
  );
}
