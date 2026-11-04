import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BoardSkeleton } from "@/components/board/board-skeleton";
import { PostDetail } from "@/components/board/post-detail";
import { getBoard } from "@/lib/config/boards";
import { getPostAttachments, getPublishedPost } from "@/lib/queries/posts";

async function load(params: PageProps<"/news/[board]/[id]">["params"]) {
  const { board: boardKey, id } = await params;
  const board = getBoard(boardKey);
  const postId = Number(id);
  if (!board || !Number.isInteger(postId) || postId <= 0) return null;
  const post = await getPublishedPost(board.key, postId);
  return post ? { board, post } : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/news/[board]/[id]">): Promise<Metadata> {
  const data = await load(params);
  return data ? { title: `${data.post.title} - ${data.board.title}` } : {};
}

export default function PostPage(props: PageProps<"/news/[board]/[id]">) {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <PostContent {...props} />
    </Suspense>
  );
}

async function PostContent({ params }: PageProps<"/news/[board]/[id]">) {
  const data = await load(params);
  if (!data) notFound();
  const attachments = await getPostAttachments(data.post.id);
  return (
    <PostDetail post={data.post} attachments={attachments} listHref={`/news/${data.board.key}`} />
  );
}
