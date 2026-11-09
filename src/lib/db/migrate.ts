/**
 * 마이그레이션 적용 스크립트:  npm run db:migrate
 * drizzle/ 디렉터리의 SQL 마이그레이션을 순서대로 적용한다.
 */
import "../env/load-cli";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createDatabase } from "./factory";

async function main() {
  const db = createDatabase();
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✔ 데이터베이스 마이그레이션 완료");
}

main().catch((error) => {
  console.error("✖ 마이그레이션 실패", error);
  process.exit(1);
});
