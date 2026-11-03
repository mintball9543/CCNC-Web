import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostForm } from "@/components/admin/post-form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deletePostAction } from "@/lib/actions/post.actions";
import { requireAdmin } from "@/lib/auth/guard";
import { getBoard } from "@/lib/config/boards";
import * as postRepository from "@/lib/repositories/post.repository";

export default async function EditPostPage({ params }: PageProps<"/admin/boards/[board]/[id]">) {
  const session = await requireAdmin();
  const { board: boardKey, id } = await params;
  const board = getBoard(boardKey);
  if (!board) notFound();
  const post = await postRepository.findPost(board.key, Number(id), { publishedOnly: false });
  if (!post) notFound();

  return (
    <>
      <AdminPageHeader
        title={`${board.title} 수정`}
        actions={
          <form action={deletePostAction.bind(null, board.key, post.id)}>
            <ConfirmSubmitButton message="이 게시글을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.">
              삭제
            </ConfirmSubmitButton>
          </form>
        }
      />
      <PostForm board={board} post={post} defaultAuthor={session.displayName} />
    </>
  );
}
