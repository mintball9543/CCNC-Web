import { connection } from "next/server";
import { Suspense } from "react";
import { Bus, Car, ExternalLink, MapPin, Phone } from "lucide-react";
import { NaverMap } from "@/components/map/naver-map";
import { naverMapSearchUrl, resolveNaverMapConfig } from "@/lib/config/naver-map";
import { siteConfig } from "@/lib/config/site";
import { getContactSettings } from "@/lib/queries/site";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/about/location");

/** 오시는 길 — 주소·연락처·교통·주차 (관리자 > 기관 정보에서 수정) */
export default async function Page() {
  const contact = await getContactSettings();
  const pending = "관리자 확인 후 게시됩니다.";
  const rows = [
    {
      Icon: MapPin,
      label: "주소",
      value: contact.address
        ? `${contact.postalCode ? `(${contact.postalCode}) ` : ""}${contact.address} ${contact.addressDetail}`
        : `${contact.addressDetail} (도로명 주소 확인 후 게시)`,
    },
    {
      Icon: Phone,
      label: "연락처",
      value:
        [
          contact.phone && `전화 ${contact.phone}`,
          contact.fax && `팩스 ${contact.fax}`,
          contact.email,
        ]
          .filter(Boolean)
          .join(" · ") || pending,
    },
    { Icon: Bus, label: "대중교통", value: contact.transit || pending },
    { Icon: Car, label: "주차", value: contact.parking || pending },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Suspense fallback={<MapFrame />}>
          <LocationMap address={contact.address} />
        </Suspense>
        <a
          href={naverMapSearchUrl(contact.address || siteConfig.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          네이버 지도에서 보기
          <ExternalLink className="size-3.5" aria-hidden />
          <span className="sr-only"> (새 창)</span>
        </a>
      </div>
      <dl className="divide-y divide-border rounded-2xl border border-border">
        {rows.map(({ Icon, label, value }) => (
          <div key={label} className="flex flex-col gap-1 p-5 sm:flex-row sm:gap-6">
            <dt className="flex w-32 shrink-0 items-center gap-2 font-semibold">
              <Icon className="size-4 text-primary" aria-hidden />
              {label}
            </dt>
            <dd className="whitespace-pre-line text-muted-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">
        ※ 센터는 충남연구원 건물 2층에 위치하며, 충남연구원과 별도로 운영되는 독립 기관입니다.
      </p>
    </div>
  );
}

/** 지도 API 키는 서버 재시작만으로 바뀌도록 요청 시점에 읽는다 (빌드 결과에 고정하지 않음) */
async function LocationMap({ address }: { address: string }) {
  await connection();
  const config = resolveNaverMapConfig(process.env);
  if (!config)
    return (
      <MapFrame message="지도를 준비 중입니다. 아래 ‘네이버 지도에서 보기’를 이용해 주세요." />
    );
  return <NaverMap config={config} address={address} title={siteConfig.name} />;
}

function MapFrame({ message = "지도를 불러오는 중입니다…" }: { message?: string }) {
  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-muted p-6 text-center text-sm text-muted-foreground sm:aspect-[16/9]">
      <MapPin className="size-6 text-primary" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
