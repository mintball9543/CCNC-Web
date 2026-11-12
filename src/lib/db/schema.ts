import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { ChartRow, ContactSettings } from "@/types";

/**
 * 데이터베이스 스키마 (SQLite / libSQL).
 * 변경 후 `npm run db:generate` 로 마이그레이션을 생성하고 `npm run db:migrate` 로 적용한다.
 */

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
};

/** 관리자 계정 */
export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  ...timestamps,
});

/** 게시판 게시글 (공지사항·센터소식·보도자료·자료실) */
export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    boardKey: text("board_key").notNull(),
    category: text("category"),
    title: text("title").notNull(),
    content: text("content").notNull(),
    author: text("author").notNull(),
    /** text: 기존 일반 텍스트 / html: 편집기(Tiptap)로 작성된 살균된 HTML */
    format: text("format", { enum: ["text", "html"] })
      .notNull()
      .default("text"),
    /** 목록·메인 활동 사진용 대표 이미지 (본문 첫 이미지에서 자동 추출) */
    thumbnailUrl: text("thumbnail_url"),
    isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    publishedAt: integer("published_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    ...timestamps,
  },
  (table) => [index("posts_board_idx").on(table.boardKey, table.isPinned, table.publishedAt)],
);

/** 메인 화면 모달 팝업 */
export const popups = sqliteTable("popups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  linkUrl: text("link_url"),
  position: text("position", { enum: ["center", "custom"] })
    .notNull()
    .default("center"),
  left: integer("left").notNull().default(0),
  top: integer("top").notNull().default(0),
  width: integer("width").notNull().default(400),
  height: integer("height"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  startsAt: integer("starts_at", { mode: "timestamp" }),
  endsAt: integer("ends_at", { mode: "timestamp" }),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/** 문의 게시판 */
export const inquiries = sqliteTable(
  "inquiries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    authorName: text("author_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    /** 비공개 문의 열람·수정용 비밀번호 해시 (bcrypt) — 공개 문의는 비밀번호 없음 */
    passwordHash: text("password_hash"),
    /** 작성한 브라우저 식별값(쿠키)의 SHA-256 — '본인 글 보기'·공개 문의 수정/삭제 권한 확인 */
    ownerKeyHash: text("owner_key_hash"),
    isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(true),
    answer: text("answer"),
    answeredBy: text("answered_by"),
    answeredAt: integer("answered_at", { mode: "timestamp" }),
    /** 답변 알림 메일 발송 시각 */
    notifiedAt: integer("notified_at", { mode: "timestamp" }),
    ...timestamps,
  },
  (table) => [
    index("inquiries_created_idx").on(table.createdAt),
    index("inquiries_owner_idx").on(table.ownerKeyHash),
  ],
);

/** 업로드 파일 (본문 이미지 · 게시글 첨부파일 · 메인 비주얼 이미지) */
export const files = sqliteTable(
  "files",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** data/uploads 아래 저장 파일명 (무작위 + 확장자) */
    storageKey: text("storage_key").notNull().unique(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    kind: text("kind", { enum: ["image", "attachment"] }).notNull(),
    /** 첨부파일이 연결된 게시글 (null 이면 미연결) */
    postId: integer("post_id").references(() => posts.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("files_post_idx").on(table.postId)],
);

/** 메뉴 노출 설정 — key: 대메뉴는 "section:<key>", 하위 메뉴는 경로("/about/greeting") */
export const menuSettings = sqliteTable("menu_settings", {
  key: text("key").primaryKey(),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

/** 사이트 설정 (key-value, JSON) — 예: contact(주소·연락처) */
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).$type<ContactSettings>().notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

/** 조직도 구성원 */
export const orgMembers = sqliteTable("org_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** 소속 (예: 센터장, 정책지원팀, 운영위원회) */
  department: text("department").notNull(),
  position: text("position").notNull(),
  name: text("name").notNull(),
  duties: text("duties").notNull().default(""),
  phone: text("phone"),
  email: text("email"),
  /** 조직도 최상단(센터장 등)에 표시 */
  isHead: integer("is_head", { mode: "boolean" }).notNull().default(false),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/** 관리자가 수치를 입력해 그리는 도표 */
export const chartDatasets = sqliteTable("chart_datasets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** 페이지에서 참조하는 고유 키 (예: chungnam-emissions) */
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  unit: text("unit").notNull().default(""),
  chartType: text("chart_type", { enum: ["bar", "line", "stacked"] })
    .notNull()
    .default("bar"),
  /** 가로축 이름 (예: 연도) */
  categoryLabel: text("category_label").notNull().default("연도"),
  /** 계열 이름 목록 */
  series: text("series", { mode: "json" }).$type<string[]>().notNull(),
  /** 행 데이터 [{ label: "2024", values: [1, 2] }] */
  rows: text("rows", { mode: "json" }).$type<ChartRow[]>().notNull(),
  source: text("source").notNull().default(""),
  sourceUrl: text("source_url"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  showOnHome: integer("show_on_home", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/** 메인 '숫자로 보는 센터' 주요 실적 */
export const statHighlights = sqliteTable("stat_highlights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  value: integer("value").notNull(),
  unit: text("unit").notNull().default(""),
  /** 기준 (예: 2025년 누적) */
  description: text("description").notNull().default(""),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/** 메인 비주얼 슬라이드 (행사·활동 사진) */
export const heroSlides = sqliteTable("hero_slides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt").notNull(),
  title: text("title").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  linkUrl: text("link_url"),
  /** 활동 갤러리 게시글과 연동된 슬라이드 (게시글 삭제 시 함께 삭제) */
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/** 하단 관련 기관 사이트 (로고 배너) */
export const relatedSites = sqliteTable("related_sites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  /** 로고 이미지 (/related-sites/… 기본 이미지 또는 업로드한 /files/{id}) */
  logoUrl: text("logo_url"),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/** 관리자 작업 기록 — 접속 IP·페이지 열람·변경 내역 */
export const adminAuditLogs = sqliteTable(
  "admin_audit_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    ip: text("ip").notNull(),
    userAgent: text("user_agent"),
    /** 로그인한 관리자 (로그인 실패 등은 null) */
    adminId: integer("admin_id"),
    /** 분류: view(페이지 열람) / auth(로그인·로그아웃) / change(등록·수정·삭제) */
    category: text("category", { enum: ["view", "auth", "change"] }).notNull(),
    /** 동작 코드 (예: post.update) */
    action: text("action").notNull(),
    /** 대상 (예: posts:12) */
    target: text("target"),
    /** 사람이 읽는 설명 */
    summary: text("summary").notNull(),
    path: text("path"),
  },
  (table) => [index("audit_created_idx").on(table.createdAt), index("audit_ip_idx").on(table.ip)],
);

/** 일별 방문 집계 — 날짜는 한국 시간 기준 YYYY-MM-DD */
export const visitDaily = sqliteTable("visit_daily", {
  day: text("day").primaryKey(),
  /** 방문자 수 (같은 날 같은 접속자는 1번) */
  visitors: integer("visitors").notNull().default(0),
  /** 페이지 열람 수 */
  pageViews: integer("page_views").notNull().default(0),
});

/**
 * 같은 날 중복 방문 확인용 — IP·브라우저 정보를 그날의 비밀 값과 섞은 일회성 해시만 저장한다
 * (원래 IP 로 되돌릴 수 없음). 지난 날짜의 행은 바로 지운다.
 */
export const visitSeen = sqliteTable(
  "visit_seen",
  {
    day: text("day").notNull(),
    hash: text("hash").notNull(),
  },
  (table) => [primaryKey({ columns: [table.day, table.hash] })],
);

export type AdminUserRow = typeof adminUsers.$inferSelect;
export type PostRow = typeof posts.$inferSelect;
export type NewPostRow = typeof posts.$inferInsert;
export type PopupRow = typeof popups.$inferSelect;
export type NewPopupRow = typeof popups.$inferInsert;
export type InquiryRow = typeof inquiries.$inferSelect;
export type NewInquiryRow = typeof inquiries.$inferInsert;
export type FileRow = typeof files.$inferSelect;
export type OrgMemberRow = typeof orgMembers.$inferSelect;
export type ChartDatasetRow = typeof chartDatasets.$inferSelect;
export type StatHighlightRow = typeof statHighlights.$inferSelect;
export type HeroSlideRow = typeof heroSlides.$inferSelect;
export type RelatedSiteRow = typeof relatedSites.$inferSelect;
export type AdminAuditLogRow = typeof adminAuditLogs.$inferSelect;
