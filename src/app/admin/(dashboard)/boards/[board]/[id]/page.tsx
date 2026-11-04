import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { PostForm } from "@/components/admin/post-form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deletePostAction } from "@/lib/actions/post.actions";
import { requireAdmin } from "@/lib/auth/guard";
import { getBoard } from "@/lib/config/boards";
import * as fileRepository from "@/lib/repositories/file.repository";
import * as postRepository from "@/lib/repositories/post.repository";
import { fileUrl } from "@/lib/uploads/url";

export default function EditPostPage(props: PageProps<"/admin/boards/[board]/[id]">) {
  return (
    <AdminSuspense>
      <Content {...props} />
    </AdminSuspense>
  );
}

async function Content({ params }: PageProps<"/admin/boards/[board]/[id]">) {
  const session = await requireAdmin();
  const { board: boardKey, id } = await params;
  const board = getBoard(boardKey);
  if (!board) notFound();
  const post = await postRepository.findPost(board.key, Number(id), { publishedOnly: false });
  if (!post) notFound();
  const attachments = (await fileRepository.listPostAttachments(post.id)).map((f) => ({
    id: f.id,
    url: fileUrl(f.id),
    originalName: f.originalName,
    mimeType: f.mimeType,
    size: f.size,
    kind: f.kind,
  }));

  return (
    <>
      <AdminPageHeader
        title={`${board.title} 수정`}
        actions={
          <form action={deletePostAction.bind(null, board.key, post.id)}>
            <ConfirmSubmitButton message="이 게시글과 첨부파일을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.">
              삭제
            </ConfirmSubmitButton>
          </form>
        }
      />
      <PostForm
        board={board}
        post={post}
        attachments={attachments}
        defaultAuthor={session.displayName}
      />
    </>
  );
}
