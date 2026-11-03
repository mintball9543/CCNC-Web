import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostForm } from "@/components/admin/post-form";
import { requireAdmin } from "@/lib/auth/guard";
import { getBoard } from "@/lib/config/boards";

export default async function NewPostPage({ params }: PageProps<"/admin/boards/[board]/new">) {
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
