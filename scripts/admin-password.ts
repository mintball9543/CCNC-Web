/**
 * 관리자 비밀번호를 .env 의 ADMIN_PASSWORD 로 설정:  npm run admin:password
 *
 * 관리자 비밀번호는 DB 에 저장되므로 .env 의 ADMIN_PASSWORD 를 바꿔도 자동으로 바뀌지 않는다.
 * (.env 값은 최초 계정을 만들 때만 사용됨) .env 값을 적용하고 싶을 때 이 명령을 실행한다.
 */
import "../src/lib/env/load-cli";
import { asc, eq } from "drizzle-orm";
import { hashPassword } from "../src/lib/auth/password";
import { createDatabase } from "../src/lib/db/factory";
import { adminUsers } from "../src/lib/db/schema";

async function main() {
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (password.length < 8) {
    throw new Error(".env 의 ADMIN_PASSWORD 가 비어 있거나 8자 미만입니다.");
  }
  const db = createDatabase();
  const admin = await db.query.adminUsers.findFirst({ orderBy: [asc(adminUsers.id)] });
  const passwordHash = await hashPassword(password);
  if (admin) {
    await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, admin.id));
    console.log("✔ 관리자 비밀번호를 .env 의 ADMIN_PASSWORD 값으로 변경했습니다.");
  } else {
    await db.insert(adminUsers).values({
      username: process.env.ADMIN_USERNAME || "admin",
      passwordHash,
      displayName: "관리자",
    });
    console.log("✔ 관리자 계정을 만들었습니다.");
  }
  console.log("  이미 로그인되어 있던 세션은 만료 시각(최대 8시간)까지 유지됩니다.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("✖", error instanceof Error ? error.message : error);
    process.exit(1);
  });
