import { PenLine } from "lucide-react";
import { Suspense } from "react";
import { BoardSkeleton } from "@/components/board/board-skeleton";
import { InquiryTable } from "@/components/inquiry/inquiry-table";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getPublicInquiries } from "@/lib/queries/inquiries";
import { navMetadata } from "@/lib/seo";

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
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const result = await getPublicInquiries(page);
  return (
    <>
      <InquiryTable
        items={result.items}
        startNumber={result.total - (result.page - 1) * result.pageSize}
        hrefFor={(item) => `/news/inquiry/${item.id}`}
      />
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        hrefFor={(p) => (p > 1 ? `/news/inquiry?page=${p}` : "/news/inquiry")}
      />
    </>
  );
}
