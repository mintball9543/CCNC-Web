/**
 * 환경 변수(.env) 점검:  npm run env:check
 *
 * 앱(Next.js)과 같은 방식으로 .env 를 읽어 다음을 확인한다. 비밀 값은 출력하지 않는다.
 * - .env 파일이 실제로 저장되었는지 (.env.example 과 동일하면 경고)
 * - AUTH_SECRET 길이 (32자 미만이면 개발 모드에서는 무시되고 운영에서는 실행 불가)
 * - ADMIN_PASSWORD 가 DB 의 관리자 비밀번호와 같은지 (.env 를 바꿔도 DB 는 자동으로 바뀌지 않음)
 * - SMTP 서버 접속·로그인 가능 여부, 받는 사람에게 보이는 보내는 사람
 * - 네이버 지도 Client ID·좌표
 */
import { loadedEnv } from "../src/lib/env/load-cli";
import { existsSync, readFileSync } from "node:fs";
import nodemailer from "nodemailer";
import { verifyPassword } from "../src/lib/auth/password";
import { createDatabase } from "../src/lib/db/factory";
import { resolveNaverMapConfig } from "../src/lib/config/naver-map";
import { resolveMailMode, senderDomainMismatch, senderIsRewritten } from "../src/lib/mail/config";

const EXAMPLE_SECRET = "change-me-to-a-long-random-string-at-least-32-chars";
const EXAMPLE_PASSWORD = "change-me-now!";

let errors = 0;
let warnings = 0;
const ok = (msg: string) => console.log(`  ✔ ${msg}`);
const warn = (msg: string) => {
  warnings++;
  console.log(`  ⚠ ${msg}`);
};
const fail = (msg: string) => {
  errors++;
  console.log(`  ✖ ${msg}`);
};
const section = (title: string) => console.log(`\n■ ${title}`);

async function main() {
  section(".env 파일");
  const files = loadedEnv.loadedEnvFiles.map((f) => f.path);
  if (!existsSync(".env")) {
    fail(".env 파일이 없습니다. cp .env.example .env 후 값을 입력하세요.");
  } else {
    ok(`읽은 파일: ${files.join(", ") || "(없음)"}`);
    if (existsSync(".env.example") && readFileSync(".env").equals(readFileSync(".env.example"))) {
      fail(
        ".env 가 .env.example 과 완전히 같습니다. 편집기에서 수정한 내용이 저장(Ctrl+S)되지 않았을 수 있습니다.",
      );
    }
    const untouched =
      process.env.AUTH_SECRET === EXAMPLE_SECRET &&
      process.env.ADMIN_PASSWORD === EXAMPLE_PASSWORD &&
      !process.env.SMTP_HOST;
    if (untouched) {
      fail(
        "AUTH_SECRET·ADMIN_PASSWORD·SMTP 가 모두 예시 값 그대로입니다. 편집 내용이 저장(Ctrl+S)되지 않았을 수 있습니다.",
      );
    }
    const overrides = files.filter((f) => f !== ".env");
    if (overrides.length > 0) warn(`${overrides.join(", ")} 의 값이 .env 보다 우선 적용됩니다.`);
  }

  section("관리자 세션 서명 키 (AUTH_SECRET)");
  const secret = process.env.AUTH_SECRET ?? "";
  if (!secret) fail("비어 있습니다.");
  else if (secret.length < 32)
    fail(
      `${secret.length}자입니다. 32자 이상이어야 합니다. (개발 모드에서는 무시되고 임시 키가 쓰이며, 운영 모드에서는 서버가 시작되지 않습니다)`,
    );
  else if (secret === EXAMPLE_SECRET) warn("예시 값 그대로입니다. 운영 전 무작위 값으로 바꾸세요.");
  else ok(`설정됨 (${secret.length}자)`);

  section("관리자 비밀번호 (ADMIN_PASSWORD)");
  const envPassword = process.env.ADMIN_PASSWORD ?? "";
  try {
    const db = createDatabase();
    const admin = await db.query.adminUsers.findFirst({ orderBy: (t, { asc }) => [asc(t.id)] });
    if (!admin) {
      fail("DB 에 관리자 계정이 없습니다. npm run db:seed 를 실행하세요.");
    } else if (!envPassword) {
      warn(".env 에 ADMIN_PASSWORD 가 없습니다. (로그인은 DB 에 저장된 비밀번호로 합니다)");
    } else if (await verifyPassword(envPassword, admin.passwordHash)) {
      ok(".env 의 ADMIN_PASSWORD 로 로그인할 수 있습니다.");
      if (envPassword === EXAMPLE_PASSWORD)
        warn("예시 비밀번호 그대로입니다. 운영 전 반드시 바꾸세요.");
    } else {
      warn(
        ".env 의 ADMIN_PASSWORD 와 DB 의 관리자 비밀번호가 다릅니다. 로그인은 DB 값으로 합니다.\n" +
          "    .env 값을 적용하려면: npm run admin:password  (또는 관리자 > 기관 정보·비밀번호 에서 변경)",
      );
    }
  } catch (error) {
    fail(`DB 확인 실패: ${error instanceof Error ? error.message : String(error)}`);
  }

  section("메일 (문의 답변 알림)");
  const mail = resolveMailMode(process.env);
  if (mail.mode === "off") {
    warn(`메일 발송이 꺼져 있습니다 — ${mail.reason}`);
  } else if (mail.mode === "log") {
    ok("MAIL_TRANSPORT=log — 실제로 보내지 않고 서버 로그에만 기록합니다.");
  } else {
    const { smtp } = mail;
    ok(
      `서버 ${smtp.host}:${smtp.port} (${smtp.secure ? "SSL" : "STARTTLS/평문"}), 보내는 사람 이름 「${smtp.from.name}」`,
    );
    if (smtp.port === 465 && !smtp.secure) warn("465 포트는 보통 SMTP_SECURE=true 가 필요합니다.");
    if (smtp.port === 587 && smtp.secure) warn("587 포트는 보통 SMTP_SECURE=false 입니다.");
    if (smtp.auth && !smtp.auth.pass) warn("SMTP_PASS 가 비어 있습니다.");
    if (senderIsRewritten(smtp)) {
      warn(
        "Gmail 계정(SMTP_USER)으로 보내므로 받는 사람에게는 MAIL_FROM 이 아니라 Gmail 계정 주소가 보입니다.\n" +
          "    주소를 감추려면 기관 메일 계정(예: no-reply@기관도메인)을 SMTP 로 쓰거나,\n" +
          "    Gmail 설정 > 계정 > '다른 주소에서 메일 보내기'에 MAIL_FROM 주소를 등록하세요.",
      );
    } else if (senderDomainMismatch(smtp)) {
      warn(
        "SMTP_USER 와 MAIL_FROM 의 도메인이 다릅니다. 메일 서버가 거부하거나 스팸으로 분류할 수 있습니다.",
      );
    }
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: smtp.auth,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
      });
      await transporter.verify();
      ok("SMTP 서버 접속·로그인 성공");
    } catch (error) {
      fail(`SMTP 접속 실패: ${error instanceof Error ? error.message : String(error)}`);
      console.log("    (Gmail·네이버 등은 계정 비밀번호 대신 '앱 비밀번호'가 필요할 수 있습니다)");
    }
  }

  section("네이버 지도 (오시는 길)");
  const map = resolveNaverMapConfig(process.env);
  if (!map) {
    warn(
      "NAVER_MAP_CLIENT_ID 가 비어 있습니다. 오시는 길에 지도 대신 '네이버 지도에서 보기' 링크만 표시됩니다.",
    );
  } else {
    ok(`Client ID 설정됨 (${map.clientId.length}자)`);
    if (map.center) ok(`표시 좌표: ${map.center.lat}, ${map.center.lng}`);
    else if (process.env.NAVER_MAP_LAT || process.env.NAVER_MAP_LNG)
      warn(
        "NAVER_MAP_LAT·NAVER_MAP_LNG 가 올바른 숫자가 아니어서 무시합니다. (기관 주소로 위치를 찾음)",
      );
    else ok("좌표 미지정 — 관리자 > 기관 정보의 주소로 위치를 찾습니다.");
    console.log(
      "    (네이버 클라우드 콘솔의 Maps Application 에 'Dynamic Map'·'Geocoding' 선택과 Web 서비스 URL(사이트 주소) 등록이 필요합니다)",
    );
  }

  console.log(
    `\n결과: 오류 ${errors}건, 경고 ${warnings}건` +
      "\n※ .env 를 바꾼 뒤에는 실행 중인 서버를 재시작해야 반영됩니다. (터미널에서 Ctrl+C → npm run dev)\n",
  );
  process.exit(errors > 0 ? 1 : 0);
}

main();
