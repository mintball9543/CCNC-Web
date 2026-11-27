# syntax=docker/dockerfile:1
#
# 충청남도 탄소중립지원센터 웹사이트 — 단일 컨테이너(Node.js + SQLite 파일 DB)
# 실행 방법은 README.md 의 'Docker 로 실행' 참고.

ARG NODE_VERSION=22

# ── 1) 의존성 설치 ─────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── 2) 빌드 ───────────────────────────────────────────────────
FROM deps AS build
# NEXT_PUBLIC_SITE_URL 은 빌드 시점에 코드에 들어가므로 빌드 인자로 받는다.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_TELEMETRY_DISABLED=1 \
    # prebuild 가 마이그레이션을 실행하므로 빌드 전용 임시 DB 를 쓴다. (이미지에는 남기지 않음)
    DATABASE_URL=file:/tmp/build.db
COPY . .
RUN npm run build && rm -f /tmp/build.db*

# ── 3) 실행 ───────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# 마이그레이션·시드(tsx)가 devDependencies 에 있어 node_modules 를 그대로 가져온다.
COPY --from=build --chown=node:node /app /app
COPY --chown=node:node docker/entrypoint.sh /usr/local/bin/ccnc-entrypoint
RUN chmod +x /usr/local/bin/ccnc-entrypoint \
    && mkdir -p /app/data \
    && chown node:node /app/data
USER node
# DB 파일(data/ccnc.db)과 업로드 파일(data/uploads)이 모두 여기에 저장된다.
VOLUME ["/app/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["ccnc-entrypoint"]
CMD ["npm", "start"]
