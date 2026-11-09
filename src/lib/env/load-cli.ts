/**
 * CLI 스크립트(migrate·seed·env:check·admin:password)용 환경 변수 로더.
 * Next.js 와 같은 라이브러리(@next/env)로 .env 를 읽어, 앱과 스크립트가 같은 값을 쓰도록 한다.
 * 스크립트의 첫 번째 import 로 사용할 것.
 */
import { loadEnvConfig } from "@next/env";

export const loadedEnv = loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", {
  info: () => {},
  error: (...args: unknown[]) => console.error(...args),
});
