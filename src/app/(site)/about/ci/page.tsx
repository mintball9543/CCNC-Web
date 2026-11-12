import Image from "next/image";
import { Download, FileArchive } from "lucide-react";
import { ciColors, ciDownload } from "@/lib/config/ci";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/about/ci");

/** CI 소개 — 로고 미리보기와 구성 색상, 내려받기는 ZIP 하나로 제공 */
export default function Page() {
  return (
    <div className="space-y-12">
      <section aria-labelledby="ci-logos">
        <h2 id="ci-logos" className="mb-4 text-xl font-bold">
          로고
        </h2>
        <p className="mb-6 text-muted-foreground">
          충청남도 탄소중립지원센터의 CI(Center Identity)입니다. 아래 파일은 하단에서 한 번에
          내려받을 수 있습니다.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <LogoCard title="가로형 · 밝은 배경" bg="bg-white">
            <Image
              src="/brand/ccnc-logo-horizontal.webp"
              alt="충청남도 탄소중립지원센터 가로형 로고"
              width={2000}
              height={715}
              className="h-auto w-full max-w-sm"
            />
          </LogoCard>
          <LogoCard title="가로형 · 어두운 배경" bg="bg-[#0b1217]">
            <Image
              src="/brand/ccnc-logo-horizontal-dark.webp"
              alt="충청남도 탄소중립지원센터 가로형 로고(어두운 배경용)"
              width={2000}
              height={715}
              className="h-auto w-full max-w-sm"
            />
          </LogoCard>
          <LogoCard title="세로형" bg="bg-white">
            <Image
              src="/brand/ccnc-logo-vertical.png"
              alt="충청남도 탄소중립지원센터 세로형 로고"
              width={1552}
              height={1576}
              className="h-auto w-full max-w-48"
            />
          </LogoCard>
          <LogoCard title="심볼" bg="bg-white">
            <Image
              src="/brand/ccnc-symbol.png"
              alt="충청남도 탄소중립지원센터 심볼"
              width={992}
              height={992}
              className="h-auto w-full max-w-40"
            />
          </LogoCard>
        </div>
      </section>

      <section aria-labelledby="ci-colors">
        <h2 id="ci-colors" className="mb-4 text-xl font-bold">
          구성 색상
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {ciColors.map((color) => (
            <li key={color.hex} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-16" style={{ background: color.hex }} aria-hidden />
              <div className="p-3 text-sm">
                <p className="font-medium">{color.name}</p>
                <p className="font-mono text-xs text-muted-foreground uppercase">{color.hex}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="ci-download"
        className="rounded-2xl border border-border bg-primary-soft p-6"
      >
        <h2 id="ci-download" className="flex items-center gap-2 text-xl font-bold">
          <FileArchive className="size-5 text-primary" aria-hidden />
          CI 내려받기
        </h2>
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          {ciDownload.contents.map((item) => (
            <li key={item.format}>
              <strong className="mr-2 text-foreground">{item.format}</strong>
              {item.description}
            </li>
          ))}
        </ul>
        <a
          href={ciDownload.href}
          download={ciDownload.fileName}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 font-medium text-primary-foreground transition hover:bg-primary-hover"
        >
          <Download className="size-5" aria-hidden />
          CI 전체 내려받기 (ZIP)
        </a>
      </section>
    </div>
  );
}

function LogoCard({
  title,
  bg,
  children,
}: {
  title: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border">
      <div className={`flex min-h-48 items-center justify-center p-8 ${bg}`}>{children}</div>
      <figcaption className="border-t border-border bg-card px-4 py-2 text-sm text-muted-foreground">
        {title}
      </figcaption>
    </figure>
  );
}
