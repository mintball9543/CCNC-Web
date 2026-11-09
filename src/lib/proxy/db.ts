/** proxy 전용 DB 연결 (렌더링 코드의 server-only 싱글턴과 분리) */
import { createDatabase, type Database } from "@/lib/db/factory";

let db: Database | null = null;

export function getProxyDb(): Database {
  db ??= createDatabase();
  return db;
}
