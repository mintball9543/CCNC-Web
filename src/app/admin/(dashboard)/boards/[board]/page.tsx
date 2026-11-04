import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { PostTable } from "@/components/board/post-table";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { requireAdmin } from "@/lib/auth/guard";
import { getBoard } from "@/lib/config/boards";
import * as postRepository from "@/lib/repositories/post.repository";

export default function AdminBoardPage(props: PageProps<"/admin/boards/[board]">) {
  return (
    <AdminSuspense>
      <Content {...props} />
    </AdminSuspense>
  );
}

async function Content({ params, searchParams }: PageProps<"/admin/boards/[board]">) {
  await requireAdmin();
  const board = getBoard((await params).board);
  if (!board) notFound();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const result = await postRepository.listPosts({
    boardKey: board.key,
    page,
    publishedOnly: false,
    pageSize: 20,
  });
  const base = `/admin/boards/${board.key}`;

  return (
    <>
      <AdminPageHeader
        title={`${board.title} 관리`}
        description={`전체 ${result.total}건 (비공개 포함)`}
        actions={
          <ButtonLink href={`${base}/new`}>
            <Plus className="size-4" aria-hidden />
            글쓰기
          </ButtonLink>
        }
      />
      <div className="rounded-xl bg-card p-4">
        <PostTable
          boardKey={board.key}
          posts={result.items}
          startNumber={result.total - (result.page - 1) * result.pageSize}
          hrefFor={(post) => `${base}/${post.id}`}
        />
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          hrefFor={(p) => `${base}?page=${p}`}
        />
      </div>
    </>
  );
}
