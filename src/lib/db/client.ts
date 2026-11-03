import "server-only";
import { createDatabase, type Database } from "./factory";

/** 개발 모드 HMR 시 커넥션이 중복 생성되지 않도록 전역에 보관 */
const globalForDb = globalThis as unknown as { __ccncDb?: Database };

export const db: Database = globalForDb.__ccncDb ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__ccncDb = db;
}
