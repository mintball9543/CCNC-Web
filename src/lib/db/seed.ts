/**
 * 초기 데이터 스크립트:  npm run db:seed
 * - 관리자 계정이 없을 때 .env 의 ADMIN_USERNAME / ADMIN_PASSWORD 로 생성
 * - 기능 확인용 샘플 데이터(비활성 팝업 1건)를 생성
 *
 * ⚠️ 게시글·통계 등 실제 콘텐츠는 공식 자료로만 등록한다. 샘플 게시글은 만들지 않는다.
 */
import { eq } from "drizzle-orm";
import { hashPassword } from "../auth/password";
import { createDatabase } from "./factory";
import { adminUsers, popups } from "./schema";

async function main() {
  const db = createDatabase();

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("ADMIN_USERNAME / ADMIN_PASSWORD 환경 변수가 필요합니다. (.env.example 참고)");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD 는 8자 이상이어야 합니다.");
  }

  const existing = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.username, username),
  });
  if (existing) {
    console.log(`• 관리자 계정 '${username}' 이(가) 이미 존재합니다. (건너뜀)`);
  } else {
    await db.insert(adminUsers).values({
      username,
      passwordHash: await hashPassword(password),
      displayName: "관리자",
    });
    console.log(`✔ 관리자 계정 '${username}' 생성`);
  }

  const popupCount = await db.$count(popups);
  if (popupCount === 0) {
    await db.insert(popups).values({
      title: "샘플 팝업 (비활성)",
      content: "관리자 > 팝업 관리에서 내용·위치·크기를 수정하고 활성화하세요.",
      position: "center",
      width: 420,
      isActive: false,
    });
    console.log("✔ 샘플 팝업 1건 생성 (비활성 상태)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("✖ 시드 실패", error);
    process.exit(1);
  });
