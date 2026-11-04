import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { PostForm } from "@/components/admin/post-form";
import { requireAdmin } from "@/lib/auth/guard";
import { getBoard } from "@/lib/config/boards";

export default function NewPostPage(props: PageProps<"/admin/boards/[board]/new">) {
  return (
    <AdminSuspense>
      <Content {...props} />
    </AdminSuspense>
  );
}

async function Content({ params }: PageProps<"/admin/boards/[board]/new">) {
  const session = await requireAdmin();
  const board = getBoard((await params).board);
  if (!board) notFound();
  return (
    <>
      <AdminPageHeader title={`${board.title} 글쓰기`} />
      <PostForm board={board} defaultAuthor={session.displayName} />
    </>
  );
}
