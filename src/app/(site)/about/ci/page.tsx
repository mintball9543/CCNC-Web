import Image from "next/image";
import { Download, FileArchive } from "lucide-react";
import { navMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils/cn";

export const metadata = navMetadata(
  "/about/ci",
  "회색의 탄소가 한 칸씩 녹색으로 바뀌는, 전환의 과정을 담은 충청남도 탄소중립지원센터 CI를 소개합니다.",
);

// 내용 출처: 센터 제공 CI 소개서 「콘셉트 3 · 전환의 C」 (ISSUES.md 2026-11-12)
const keywords = ["전환", "단계적 실천", "데이터", "CCNC", "넷제로"];

const colors = [
  { name: "Carbon Grey", hex: "#6E7881" },
  { name: "Transition Green", hex: "#24B566" },
  { name: "Neutral Lime", hex: "#86D23B" },
];

const logo = {
  horizontal: { src: "/brand/ccnc-logo-horizontal.png", width: 2000, height: 715 },
  horizontalDark: { src: "/brand/ccnc-logo-horizontal-dark.png", width: 2000, height: 715 },
  vertical: { src: "/brand/ccnc-logo-vertical.png", width: 1552, height: 1576 },
  symbol: { src: "/brand/ccnc-symbol.png", width: 992, height: 992 },
};

/** 흑백·단색은 원본 로고(투명 배경)에 색 필터를 씌워 표시 */
const BLACK = "brightness-0";
const WHITE = "brightness-0 invert";

interface Mark {
  image: (typeof logo)[keyof typeof logo];
  imageClass: string;
  /** 바탕(필터가 바탕색에 걸리지 않도록 이미지 바깥에 둔다) */
  frameClass?: string;
}

const usages: { label: string; marks: Mark[] }[] = [
  { label: "가로형 (기본)", marks: [{ image: logo.horizontal, imageClass: "w-64" }] },
  { label: "세로형", marks: [{ image: logo.vertical, imageClass: "w-36" }] },
  { label: "심볼 단독", marks: [{ image: logo.symbol, imageClass: "w-32" }] },
  { label: "흑백", marks: [{ image: logo.horizontal, imageClass: cn("w-64", BLACK) }] },
  {
    label: "역상",
    marks: [
      {
        image: logo.horizontalDark,
        imageClass: "w-56",
        frameClass: "rounded-2xl bg-ci-navy px-6 py-4",
      },
    ],
  },
  {
    label: "단색 심볼",
    marks: [
      { image: logo.symbol, imageClass: cn("w-24", BLACK) },
      {
        image: logo.symbol,
        imageClass: cn("w-20", WHITE),
        frameClass: "rounded-2xl bg-ci-navy p-1",
      },
    ],
  },
];

/** CI 파일 묶음 — 원본이 바뀌면 public/downloads 의 같은 이름 파일만 교체 */
const ciZip = {
  file: "/downloads/CCNC_CI.zip",
  saveAs: "CCNC_CI.zip",
  formats: ["AI", "SVG", "PNG"],
  types: "가로형 · 세로형 · 심볼 (각각 투명 배경 / 흰 배경)",
  info: "ZIP · 18개 파일 · 423KB",
};

/** CI 소개 — 센터 제공 CI 소개서를 바탕으로 의미·키워드·컬러·활용 예시와 CI 파일(ZIP) 내려받기 */
export default function Page() {
  return (
    <div className="space-y-14">
      <section aria-labelledby="ci-concept-heading" className="space-y-6">
        <div>
          <p className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
            콘셉트
          </p>
          <h2 id="ci-concept-heading" className="mt-3 text-2xl font-bold sm:text-3xl">
            전환의 C
          </h2>
          <p className="mt-2 text-muted-foreground">
            회색의 탄소가 한 칸씩 녹색으로 바뀌는, 전환의 과정을 담은 로고
          </p>
        </div>
        <div className="flex justify-center rounded-2xl border border-border bg-white px-6 py-12 sm:py-16">
          <Image
            src={logo.horizontal.src}
            alt="충청남도 탄소중립지원센터 CI (가로형)"
            width={logo.horizontal.width}
            height={logo.horizontal.height}
            priority
            className="h-auto w-full max-w-xl"
          />
        </div>
      </section>

      <section aria-labelledby="ci-meaning-heading">
        <h2 id="ci-meaning-heading" className="mb-5 text-xl font-bold">
          디자인 의미
        </h2>
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-border p-6 sm:flex-row sm:items-start">
          <Image
            src={logo.symbol.src}
            alt=""
            width={logo.symbol.width}
            height={logo.symbol.height}
            className="size-32 shrink-0 rounded-xl bg-white"
          />
          <div className="space-y-2 leading-relaxed">
            <p>일곱 개의 타일이 CCNC의 &lsquo;C&rsquo;를 그립니다.</p>
            <p>
              회색(탄소)에서 녹색(중립)으로 한 칸씩 바뀌는 색은 단계적이고 실천 가능한 전환 과정을,
              비어 있는 마지막 자리의 원(0)은 넷제로를 뜻합니다.
            </p>
            <p>데이터 기반으로 지원하는 센터의 역할을 표현했습니다.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="ci-keyword-heading">
          <h2 id="ci-keyword-heading" className="mb-5 text-xl font-bold">
            키워드
          </h2>
          <ul className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <li key={k} className="rounded-full bg-muted px-4 py-2 font-medium">
                {k}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="ci-color-heading">
          <h2 id="ci-color-heading" className="mb-5 text-xl font-bold">
            컬러
          </h2>
          <ul className="space-y-3">
            {colors.map((c) => (
              <li key={c.hex} className="flex items-center gap-4">
                <span
                  className="size-12 shrink-0 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: c.hex }}
                  aria-hidden
                />
                <span>
                  <span className="block font-medium">{c.name}</span>
                  <span className="font-mono text-sm text-muted-foreground">{c.hex}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="ci-usage-heading">
        <h2 id="ci-usage-heading" className="mb-5 text-xl font-bold">
          다양한 활용 예시
        </h2>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {usages.map((u) => (
            <li key={u.label} className="flex flex-col items-center gap-5 bg-white px-6 pt-8 pb-5">
              <div className="flex min-h-40 flex-1 items-center justify-center gap-4">
                {u.marks.map((m, i) => (
                  <span key={i} className={cn("flex items-center justify-center", m.frameClass)}>
                    <Image
                      src={m.image.src}
                      alt=""
                      width={m.image.width}
                      height={m.image.height}
                      className={cn("h-auto", m.imageClass)}
                    />
                  </span>
                ))}
              </div>
              <p className="text-sm text-ci-slate">{u.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ci-download-heading">
        <h2 id="ci-download-heading" className="mb-5 text-xl font-bold">
          내려받기
        </h2>
        <div className="flex flex-col gap-4 rounded-2xl border border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <FileArchive className="mt-0.5 size-10 shrink-0 text-primary" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold">CI 파일 전체 (CCNC_CI.zip)</p>
              <ul className="flex flex-wrap gap-1.5" aria-label="포함된 파일 형식">
                {ciZip.formats.map((f) => (
                  <li key={f} className="rounded bg-muted px-2 py-0.5 text-xs font-semibold">
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">{ciZip.types}</p>
              <p className="text-sm text-muted-foreground">{ciZip.info}</p>
            </div>
          </div>
          <a
            href={ciZip.file}
            download={ciZip.saveAs}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            <Download className="size-4" aria-hidden />
            ZIP 내려받기
          </a>
        </div>
      </section>
    </div>
  );
}
