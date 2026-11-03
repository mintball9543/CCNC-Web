import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
    /** 작성자 본인 확인용 비밀번호 해시 (bcrypt) */
    passwordHash: text("password_hash").notNull(),
    isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(true),
    answer: text("answer"),
    answeredBy: text("answered_by"),
    answeredAt: integer("answered_at", { mode: "timestamp" }),
    ...timestamps,
  },
  (table) => [index("inquiries_created_idx").on(table.createdAt)],
);

export type AdminUserRow = typeof adminUsers.$inferSelect;
export type PostRow = typeof posts.$inferSelect;
export type NewPostRow = typeof posts.$inferInsert;
export type PopupRow = typeof popups.$inferSelect;
export type NewPopupRow = typeof popups.$inferInsert;
export type InquiryRow = typeof inquiries.$inferSelect;
export type NewInquiryRow = typeof inquiries.$inferInsert;
