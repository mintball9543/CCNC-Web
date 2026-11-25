import "server-only";
import { Suspense } from "react";
import {
  findNewPublications,
  GIR_BOARD_URL,
  OFFICIAL_SOURCES,
  parseGirBoard,
} from "@/lib/content/official-sources";

/**
 * 도표 관리 위 — 공식 게시판(GIR)에 지금 반영된 자료보다 새 공표 글이 있는지 열 때마다 확인한다.
 * 사이트가 응답하지 않아도 도표 관리는 그대로 쓸 수 있게 따로 불러오고, 실패하면 조용히 안내만 한다.
 */
export function OfficialSourceAlert() {
  return (
    <Suspense
      fallback={
        <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
          공식 통계 새 공표 확인 중…
        </p>
      }
    >
      <Check />
    </Suspense>
  );
}

async function loadBoard(): Promise<string | null> {
  try {
    const res = await fetch(GIR_BOARD_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CCNC-Web admin check)" },
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

async function Check() {
  const html = await loadBoard();
  const posts = html ? parseGirBoard(html) : [];
  const checked = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  if (posts.length === 0) {
    return (
      <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
        온실가스종합정보센터 게시판에 연결하지 못해 새 공표를 확인하지 못했습니다.{" "}
        <a href={GIR_BOARD_URL} target="_blank" rel="noopener noreferrer" className="underline">
          게시판 직접 보기
        </a>
      </p>
    );
  }

  const found = findNewPublications(posts);
  if (found.length === 0) {
    return (
      <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
        공식 통계 새 공표 없음 ({checked} 확인) — 지금 반영된 자료:{" "}
        {OFFICIAL_SOURCES.map((s) => s.appliedLabel).join(", ")}
      </p>
    );
  }

  return (
    <section
      aria-labelledby="official-source-heading"
      className="space-y-3 rounded-xl border border-primary/40 bg-primary-soft px-4 py-4 text-sm"
    >
      <p id="official-source-heading" className="font-semibold">
        온실가스종합정보센터에 새 통계가 공표됐습니다
      </p>
      <ul className="space-y-3">
        {found.map(({ source, post, url }) => (
          <li key={source.key} className="leading-relaxed">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              {post.title}
            </a>{" "}
            <span className="text-muted-foreground">({post.date} 공표)</span>
            <p className="text-muted-foreground">
              지금 홈페이지 수치는 {source.appliedLabel} 기준입니다. 새 자료를 확인해 코드의
              공식값을 고치면, 아래 {source.affects.map((a) => `'${a}'`).join("·")}에 &lsquo;새 공식
              자료 있음&rsquo;이 뜹니다.
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
