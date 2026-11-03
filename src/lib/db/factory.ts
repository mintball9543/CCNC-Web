import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";

export const DEFAULT_DATABASE_URL = "file:./data/ccnc.db";

/** Next 런타임과 CLI 스크립트(migrate/seed)가 공유하는 DB 생성 함수 */
export function createDatabase(
  url = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  authToken = process.env.DATABASE_AUTH_TOKEN,
) {
  if (url.startsWith("file:")) {
    mkdirSync(path.dirname(url.slice("file:".length)), { recursive: true });
  }
  const client = createClient({ url, authToken });
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDatabase>;
