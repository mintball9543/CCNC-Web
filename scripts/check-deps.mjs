/**
 * 의존성 설치 확인 — package.json 에 있는데 node_modules 에 없는 패키지가 있으면
 * `npm install` 안내와 함께 중단한다. (git pull 후 새 패키지를 설치하지 않은 경우 대비)
 * npm run dev / build 전에 자동 실행된다.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
const missing = names.filter((name) => !existsSync(path.join(root, "node_modules", name, "package.json")));

if (missing.length > 0) {
  console.error("\n✖ 설치되지 않은 패키지가 있습니다:");
  for (const name of missing) console.error(`   - ${name}`);
  console.error("\n  git pull 등으로 package.json 이 바뀐 뒤에는 먼저 아래 명령을 실행하세요.");
  console.error("    npm install\n");
  process.exit(1);
}
