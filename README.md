# 충청남도 탄소중립지원센터(CCNC) 공식 웹사이트

충청남도 탄소중립지원센터의 홍보 및 정책 정보 전달을 위한 공식 웹사이트입니다.
센터는 충남연구원 건물 2층에 위치하나 **독립적으로 운영되는 별도 기관**이므로, 사이트의 모든 표기는 센터 명의로 유지합니다.

> 작업 이력·향후 계획·미결 사항은 [`ISSUES.md`](./ISSUES.md)에서 관리합니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript |
| 스타일 | Tailwind CSS v4, Pretendard (로컬 폰트), next-themes (라이트/다크/시스템) |
| 데이터 | SQLite / libSQL + Drizzle ORM (마이그레이션: drizzle-kit) |
| 인증 | 관리자 전용 — 비밀번호만 입력, bcrypt + JWT(HS256, jose) httpOnly 쿠키, 로그인 시도 제한 |
| 편집기·파일 | Tiptap(본문 이미지·서식) + sanitize-html, 파일 업로드(data/uploads), hwp.js(HWP 미리보기) |
| 메일 | nodemailer (SMTP) — 문의 답변 알림 |
| 검증 | zod v4 (Server Action 입력 검증) |
| 품질 | ESLint, Prettier(+tailwind 플러그인), Vitest |

외부 서비스 없이 **단일 프로젝트로 완결**됩니다. (DB 파일은 `data/`에 생성)

## 시작하기

Node.js 22.12 이상이 필요합니다.

```bash
npm install
cp .env.example .env          # AUTH_SECRET, ADMIN_PASSWORD 등 수정
npm run db:setup              # 마이그레이션 + 최초 관리자 계정 생성
npm run dev                   # http://localhost:3000
```

- 관리자 화면: `/admin` — **비밀번호만 입력**합니다. (일반 이용자 회원가입은 두지 않으며, 관리자 로그인 링크는 메뉴에 노출하지 않습니다)
- 문의 답변 알림 메일을 보내려면 `.env`에 SMTP 정보를 입력하세요. 개발 중에는 `MAIL_TRANSPORT=log`로 두면 실제 발송 없이 서버 로그에만 남습니다.
- 운영 배포 전 `.env`의 `AUTH_SECRET`(32자 이상)과 `ADMIN_PASSWORD`를 반드시 변경하세요.

### 주요 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` / `build` / `start` | 개발 서버 / 프로덕션 빌드(빌드 전 자동 마이그레이션) / 실행 |
| `npm run lint` · `typecheck` · `test` | ESLint · 타입 검사(라우트 타입 생성 포함) · 단위 테스트 |
| `npm run format` | Prettier 포맷팅 |
| `npm run db:generate` | `schema.ts` 변경 후 마이그레이션 SQL 생성 (`drizzle/`) |
| `npm run db:migrate` · `db:seed` · `db:setup` | 마이그레이션 적용 · 초기 데이터 · 둘 다 |
| `npm run db:studio` | Drizzle Studio (DB 브라우저) |

## 디렉터리 구조

```
├─ drizzle/                    # DB 마이그레이션 SQL (자동 생성, 커밋 대상)
├─ public/brand/               # CI 로고 (라이트/다크 변형)
├─ scripts/make-dark-logos.py  # CI 원본 → 다크모드 로고 생성 스크립트
└─ src/
   ├─ app/                     # 라우팅 (화면 조립만 담당)
   │  ├─ (site)/               # 공개 사이트 — 헤더/푸터 공통 레이아웃
   │  │  ├─ about/             # 센터소개: 인사말·설립근거·연혁·비전·목표·조직·업무·오시는 길
   │  │  ├─ business/          # 주요사업: 정책지원·조사연구·교육·홍보·네트워크·거버넌스
   │  │  ├─ participation/     # 참여·실천: 생활실천단·탄소업슈·탄소발자국 계산기·교육 강사단
   │  │  ├─ carbon-neutral/    # 충남 탄소중립: 탄소중립 이해·2045 비전·배출현황·부문별 감축목표
   │  │  ├─ news/              # 알림마당: [board] 게시판(공지·소식·보도·자료실) + inquiry 문의
   │  │  ├─ privacy/ sitemap/
   │  │  └─ page.tsx           # 메인 (모달 팝업 포함)
   │  ├─ admin/                # 관리자 — login + (dashboard)/ 팝업·게시판·문의 관리
   │  ├─ layout.tsx            # 루트: 폰트·테마·메타데이터
   │  └─ robots.ts / sitemap.ts / icon.png
   │  ├─ api/admin/uploads/    # 관리자 파일 업로드 API
   │  └─ files/[id]/           # 업로드 파일 제공(route.ts) + 미리보기 페이지(view/)
   ├─ components/              # UI 컴포넌트 (도메인별 폴더)
   │  ├─ ui/                   # 버튼·폼·탭·페이지네이션 등 범용 프리미티브
   │  ├─ layout/ brand/ theme/ # 헤더(GNB)·푸터·LNB·브레드크럼 / CI / 테마 토글
   │  ├─ home/                 # 메인 비주얼 슬라이드·숫자로 보는 센터·센터 활동 갤러리
   │  ├─ board/ inquiry/ popup/ charts/ content/ files/ editor/
   │  └─ admin/                # 관리자 전용 폼·미리보기·도표 편집기
   ├─ hooks/                   # use-drag-resize (팝업 끌기·크기 조절)
   ├─ lib/
   │  ├─ config/               # 사이트 정보·메뉴·게시판 정의 (단일 출처)
   │  ├─ content/              # 정적 데이터 (배출 통계, 관련 사이트) — 공식 자료만
   │  ├─ db/                   # Drizzle 스키마·클라이언트·마이그레이션·시드
   │  ├─ repositories/         # 데이터 접근 계층 (순수 DB 로직)
   │  ├─ queries/              # 공개 화면 조회 ('use cache' + cacheTag)
   │  ├─ actions/              # Server Actions (인증 → 검증 → 저장 → 캐시 갱신)
   │  ├─ validation/           # zod 스키마
   │  ├─ auth/                 # 세션 토큰·쿠키·requireAdmin 가드
   │  ├─ popup/                # 팝업 배치·이동·크기 계산 (순수 함수, 테스트 포함)
   │  ├─ charts/               # 도표 축 계산·엑셀 붙여넣기 파싱
   │  ├─ uploads/              # 업로드 허용 정책(확장자+시그니처)·저장소·URL
   │  ├─ mail/                 # 메일 발송·템플릿
   │  ├─ proxy/                # proxy 전용 로직 (숨긴 메뉴 차단)
   │  ├─ cache/ utils/ seo.ts
   ├─ types/                   # 도메인 타입
   └─ proxy.ts                 # /admin 접근 제어 + 숨긴 메뉴 404 (Next 16: middleware → proxy)
```

### 계층 규칙

```
app (페이지)  ──▶  queries (캐시 조회)  ──▶  repositories  ──▶  db
     │                                         ▲
     └──▶  actions (Server Action) ── validation ┘ ── updateTag(cacheTags)
```

- **페이지/컴포넌트는 DB에 직접 접근하지 않습니다.** 공개 화면은 `lib/queries`, 관리자 화면은 `requireAdmin()` 이후 `lib/repositories`를 사용합니다.
- **모든 변경은 Server Action**에서 `requireAdmin()` → zod 검증 → repository 호출 → `updateTag()` 순서로 처리합니다.
- 공개 조회는 `'use cache'` + `cacheTag`로 캐시되며, 관리자 저장 시 같은 태그(`lib/cache/tags.ts`)로 즉시 갱신됩니다.
- Cache Components 규칙상 `cookies()`, `searchParams`, `usePathname()` 등 요청 시점 값은 `<Suspense>` 안에서만 사용합니다.
- **관리자 페이지는 `Page → <AdminSuspense><Content/></AdminSuspense>` 구조**를 지킵니다. 세션·DB 읽기를 페이지 최상단에서 하면 메뉴 간 이동이 막혀 개발 서버에 `Error: Route "/admin…": … uncached data …` 오류가 납니다.

## 자주 하는 작업

**메뉴/페이지 추가** — `src/lib/config/navigation.ts`에 항목을 추가하고 `src/app/(site)/<대메뉴>/<경로>/page.tsx`를 만듭니다.
GNB·모바일 메뉴·LNB·브레드크럼·페이지 제목·sitemap.xml이 모두 이 설정에서 파생되어 **메뉴명 = 제목 = 위치표시**가 항상 일치합니다.
페이지 메타데이터는 `export const metadata = navMetadata("/경로")`로 지정합니다.

**게시판 추가** — `src/types/board.ts`의 `BOARD_KEYS`와 `src/lib/config/boards.ts`에 정의를 추가하면 공개 목록/상세, 관리자 CRUD, 메뉴가 자동 구성됩니다.

**DB 스키마 변경** — `src/lib/db/schema.ts` 수정 → `npm run db:generate` → `npm run db:migrate`.

**도표 수치 갱신** — 관리자 > 도표 관리에서 행(연도)을 추가하거나 엑셀 표를 붙여넣습니다(공개 시 출처 필수). 배출현황 페이지는 키 `chungnam-emissions` 도표를 사용합니다(`src/lib/config/charts.ts`).

**메뉴 숨기기** — 관리자 > 메뉴 표시 설정. 새 대메뉴를 추가하면 `src/proxy.ts`의 `matcher`에도 경로를 추가하세요(테스트가 누락을 잡아냅니다).

## 관리자 기능

| 메뉴 | 내용 |
| --- | --- |
| 메인 비주얼(사진) | 메인 상단 슬라이드 사진 업로드(끌어다 놓기)·문구·링크·순서·표시 여부. 사진이 없으면 기본 디자인 |
| 팝업 관리 | 모달 팝업 On/Off, 위치(화면 중앙 / 좌상단 X·Y), 크기, 게시 기간, 순서. **미리보기에서 끌어서 위치·크기 지정**. 방문자도 팝업을 끌어 옮기고 크기 조절 가능, "오늘 하루 보지 않기" |
| 숫자로 보는 센터 | 메인 화면 주요 실적 수치(항목·수치·단위·기준) |
| 도표 관리 | 표에 수치 입력 → 막대/누적/선 도표 자동 생성, 엑셀 붙여넣기, 실시간 미리보기, 메인 표시 여부 |
| 게시판 | 공지사항·센터소식(사진 카드형)·보도자료·자료실 — 편집기(본문 이미지 끌어놓기·붙여넣기·이미지 주소 자동 변환) + 첨부파일 칸(PDF·HWP 등, 새 탭 미리보기) |
| 문의 관리 | 답변 등록·수정·삭제, **작성자에게 답변 알림 메일**, 문의 삭제 |
| 메뉴 표시 설정 | 대메뉴 전체 / 하위 메뉴별 표시·숨김 (메인 화면 포함 전체 반영, 직접 접근 시 404) |
| 조직도 | 구성원·소속·업무·연락처 → 센터소개 > 조직·업무 |
| 기관 정보·비밀번호 | 주소·전화·팩스·이메일·교통·주차 → 푸터·오시는 길 / 관리자 비밀번호 변경 |

공개 문의 게시판: 작성자 이름 마스킹, 비공개 글은 작성 시 비밀번호로만 열람, 개인정보 수집 동의, 허니팟 스팸 방지.

### 업로드 파일

- 저장 위치: `data/uploads/` (공개 폴더 밖, `/files/{id}` 라우트로만 제공). `UPLOAD_DIR` 환경 변수로 변경 가능 — **백업 대상**입니다.
- 허용 형식: 이미지(JPG·PNG·GIF·WEBP, 10MB) / 첨부(PDF·HWP·HWPX·DOC(X)·XLS(X)·PPT(X)·ZIP·TXT·CSV, 50MB). 확장자와 파일 시그니처를 함께 검사해 위장 파일을 차단하며 SVG·HTML 은 받지 않습니다.
- 미리보기: PDF·이미지·TXT 는 브라우저 기본 뷰어, HWP 는 hwp.js, 그 외는 다운로드.

## CI / 브랜드 · 다크모드

- 제공된 CI 3종(가로형·세로형·심볼)을 `public/brand/`에 두고 `<Logo variant="horizontal|vertical|symbol" />`로 사용합니다.
- 헤더·푸터·관리자 화면은 `<BrandLockup />`(심볼 이미지 + 기관명 **텍스트**)을 사용합니다. 작은 크기에서도 글자가 선명하고 테마에 따라 글자색이 자동으로 바뀝니다.
- 다크모드에서는 워드마크(남색·회색 글자)만 밝은 색으로 치환한 변형 이미지로 **CSS(`dark:` variant) 조건부 교체**합니다. JS 없이 동작해 깜빡임이 없고, 심볼의 녹색 타일은 원본 색 그대로 유지됩니다.
- CI 원본이 바뀌면 `python3 scripts/make-dark-logos.py <원본 폴더> public/brand`로 다시 생성합니다.
- 색상 토큰은 `src/app/globals.css`(`--primary` 등)와 CI 팔레트(`ci-*`)로 정의되어 있습니다. 본문 텍스트 대비를 위해 primary는 CI 녹색보다 한 단계 어둡게 설정했습니다.

## 정보 신뢰성 원칙

통계·법령·기관 정보는 **공식 기관 배포 자료만** 반영합니다. 확인되지 않은 항목은 임의로 채우지 않고 `ContentPlaceholder`(콘텐츠 준비 중)로 표시하며, 해당 작업은 `ISSUES.md`의 `CONTENT-*` 항목으로 추적합니다.
