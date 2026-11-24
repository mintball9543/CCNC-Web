import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { cacheTags } from "@/lib/cache/tags";
import { recordPostView } from "@/lib/repositories/post.repository";
import { isBotUserAgent, kstDay } from "@/lib/visits/stats";
import { isCrossSiteRequest, visitorHash } from "@/lib/visits/visitor";

/**
 * 게시글 조회수 — 공개 상세 화면(PostViewCount)이 열릴 때 호출하고, 현재 조회수를 돌려준다.
 * - 같은 접속자는 하루 한 번만 센다 (IP 는 저장하지 않고 그날의 해시만 사용)
 * - 다른 사이트에서 보낸 요청·검색엔진·로그인한 관리자는 세지 않고 현재 값만 돌려준다
 * - 조회수가 오르면 그 게시판의 목록·통합 검색 캐시를 갱신한다
 */
export async function POST(request: Request, ctx: RouteContext<"/api/posts/[id]/view">) {
  const postId = Number((await ctx.params).id);
  if (!Number.isInteger(postId) || postId <= 0) return Response.json(null, { status: 404 });

  const shouldCount =
    !isCrossSiteRequest(request.headers) &&
    !isBotUserAgent(request.headers.get("user-agent") ?? "") &&
    !(await getSession());

  const day = kstDay(new Date());
  try {
    const result = await recordPostView(postId, day, visitorHash(request.headers, day), {
      count: shouldCount,
    });
    if (!result) return Response.json(null, { status: 404 });
    // 목록·검색 결과의 조회수도 갱신 — 다음 방문 때 이전 화면을 보여 주며 뒤에서 새로 만든다
    if (result.counted) revalidateTag(cacheTags.posts(result.boardKey), "max");
    return Response.json({ views: result.views }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("조회수 집계 실패", error);
    return Response.json(null, { status: 500 });
  }
}
