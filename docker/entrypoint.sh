#!/bin/sh
# 컨테이너 시작 시: DB 마이그레이션 → (최초 1회) 관리자 계정 시드 → 서버 실행
set -e

mkdir -p /app/data

echo "• 데이터베이스 마이그레이션"
npx --no-install tsx src/lib/db/migrate.ts

# 시드는 최초 1회만 실행한다. (샘플 팝업을 다시 만들지 않도록 표식 파일 사용)
if [ ! -f /app/data/.seeded ]; then
  echo "• 최초 실행: 관리자 계정 생성"
  npx --no-install tsx src/lib/db/seed.ts
  touch /app/data/.seeded
fi

exec "$@"
