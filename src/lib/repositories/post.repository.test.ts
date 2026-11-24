import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createDatabase } from "@/lib/db/factory";
import { posts, postViewSeen } from "@/lib/db/schema";

/** 실제 마이그레이션을 적용한 임시 SQLite 파일로 게시글 저장소를 검증한다 */
const holder = vi.hoisted(() => ({ db: null as unknown }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/client", () => ({
  get db() {
    return holder.db;
  },
}));

const repo = await import("./post.repository");
const dir = mkdtempSync(path.join(tmpdir(), "ccnc-post-repo-"));
let database: ReturnType<typeof createDatabase>;

beforeAll(async () => {
  database = createDatabase(`file:${path.join(dir, "test.db")}`);
  holder.db = database;
  await migrate(database, { migrationsFolder: "./drizzle" });
});

afterAll(() => {
  database.$client.close();
  rmSync(dir, { recursive: true, force: true });
});

async function addPost(values: Partial<typeof posts.$inferInsert> & { title: string }) {
  return repo.insertPost({
    boardKey: "notice",
    content: "",
    author: "센터",
    format: "text",
    ...values,
  });
}

beforeEach(async () => {
  await database.delete(postViewSeen);
  await database.delete(posts);
});

describe("recordPostView", () => {
  it("같은 접속자는 하루 한 번, 다른 접속자·다른 날은 따로 센다", async () => {
    const id = await addPost({ title: "공지" });
    expect(await repo.recordPostView(id, "2026-11-24", "a")).toEqual({
      views: 1,
      boardKey: "notice",
      counted: true,
    });
    expect(await repo.recordPostView(id, "2026-11-24", "a")).toEqual({
      views: 1,
      boardKey: "notice",
      counted: false,
    });
    expect((await repo.recordPostView(id, "2026-11-24", "b"))?.views).toBe(2);
    expect((await repo.recordPostView(id, "2026-11-25", "a"))?.views).toBe(3);
  });

  it("지난 날짜의 중복 판별 기록은 지운다", async () => {
    const id = await addPost({ title: "공지" });
    await repo.recordPostView(id, "2026-11-24", "a");
    await repo.recordPostView(id, "2026-11-25", "a");
    const rows = await database.select().from(postViewSeen);
    expect(rows.map((r) => r.day)).toEqual(["2026-11-25"]);
  });

  it("count: false 면 세지 않고 현재 값만 돌려준다 (관리자·검색엔진)", async () => {
    const id = await addPost({ title: "공지" });
    await repo.recordPostView(id, "2026-11-24", "a");
    expect(await repo.recordPostView(id, "2026-11-24", "admin", { count: false })).toEqual({
      views: 1,
      boardKey: "notice",
      counted: false,
    });
  });

  it("비공개 글·없는 글은 null", async () => {
    const id = await addPost({ title: "비공개", isPublished: false });
    expect(await repo.recordPostView(id, "2026-11-24", "a")).toBeNull();
    expect(await repo.recordPostView(999999, "2026-11-24", "a")).toBeNull();
  });

  it("조회로는 수정 시각(updatedAt)이 바뀌지 않는다", async () => {
    const id = await addPost({ title: "공지", updatedAt: new Date("2026-01-01T00:00:00Z") });
    await repo.recordPostView(id, "2026-11-24", "a");
    const [row] = await database.select().from(posts).where(eq(posts.id, id));
    expect(row.viewCount).toBe(1);
    expect(row.updatedAt.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });

  it("목록에 조회수가 포함된다", async () => {
    const id = await addPost({ title: "공지" });
    await repo.recordPostView(id, "2026-11-24", "a");
    const list = await repo.listPosts({ boardKey: "notice" });
    expect(list.items[0].viewCount).toBe(1);
  });
});

describe("searchPublishedPosts", () => {
  const all = ["notice", "center-news", "gallery", "press", "archive"] as const;

  async function seed() {
    await addPost({
      title: "탄소중립 교육 안내",
      content: "<p>도민 대상 교육</p>",
      format: "html",
      publishedAt: new Date("2026-11-01"),
    });
    await addPost({
      boardKey: "press",
      title: "센터 개소식",
      content: "탄소중립지원센터가 문을 열었습니다.",
      publishedAt: new Date("2026-11-20"),
    });
    await addPost({
      boardKey: "archive",
      category: "report",
      title: "연구보고서",
      content: "감축률 50% 달성 방안",
      publishedAt: new Date("2026-11-10"),
    });
    await addPost({ title: "비공개 탄소중립", isPublished: false });
  }

  it("여러 게시판의 게시 글을 최신순으로, 게시판별 건수와 함께", async () => {
    await seed();
    const result = await repo.searchPublishedPosts({ keyword: "탄소중립", boardKeys: [...all] });
    expect(result.items.map((p) => p.title)).toEqual(["센터 개소식", "탄소중립 교육 안내"]);
    expect(result.total).toBe(2);
    expect(result.counts).toEqual({ notice: 1, press: 1 });
    expect(result.items[0].content).toContain("문을 열었습니다");
  });

  it("띄어쓰기로 나눈 모든 단어를 포함해야 한다", async () => {
    await seed();
    const result = await repo.searchPublishedPosts({
      keyword: "탄소중립 도민",
      boardKeys: [...all],
    });
    expect(result.items.map((p) => p.title)).toEqual(["탄소중립 교육 안내"]);
  });

  it("게시판 하나만 보아도 건수는 전체 게시판 기준", async () => {
    await seed();
    const result = await repo.searchPublishedPosts({
      keyword: "탄소중립",
      boardKeys: [...all],
      boardKey: "press",
    });
    expect(result.items.map((p) => p.boardKey)).toEqual(["press"]);
    expect(result.total).toBe(1);
    expect(result.counts).toEqual({ notice: 1, press: 1 });
  });

  it("검색 범위 밖(숨긴) 게시판은 찾지 않는다", async () => {
    await seed();
    const result = await repo.searchPublishedPosts({ keyword: "탄소중립", boardKeys: ["notice"] });
    expect(result.items.map((p) => p.boardKey)).toEqual(["notice"]);
    expect(result.counts).toEqual({ notice: 1 });
    const hidden = await repo.searchPublishedPosts({
      keyword: "탄소중립",
      boardKeys: ["notice"],
      boardKey: "press",
    });
    expect(hidden.total).toBe(0);
  });

  it("% 와 _ 는 글자 그대로 찾는다", async () => {
    await seed();
    const percent = await repo.searchPublishedPosts({ keyword: "50%", boardKeys: [...all] });
    expect(percent.items.map((p) => p.title)).toEqual(["연구보고서"]);
    const wildcard = await repo.searchPublishedPosts({ keyword: "%", boardKeys: [...all] });
    expect(wildcard.items.map((p) => p.title)).toEqual(["연구보고서"]);
    const underscore = await repo.searchPublishedPosts({ keyword: "_", boardKeys: [...all] });
    expect(underscore.total).toBe(0);
  });

  it("페이지 나누기", async () => {
    for (let i = 1; i <= 12; i++) {
      await addPost({ title: `안내 ${i}`, publishedAt: new Date(2026, 0, i) });
    }
    const page2 = await repo.searchPublishedPosts({
      keyword: "안내",
      boardKeys: [...all],
      page: 2,
      pageSize: 10,
    });
    expect(page2.totalPages).toBe(2);
    expect(page2.items.map((p) => p.title)).toEqual(["안내 2", "안내 1"]);
  });

  it("게시판 검색(listPosts)도 같은 규칙을 쓴다", async () => {
    await seed();
    const list = await repo.listPosts({ boardKey: "archive", keyword: "50%" });
    expect(list.total).toBe(1);
    const none = await repo.listPosts({ boardKey: "archive", keyword: "_" });
    expect(none.total).toBe(0);
  });
});
