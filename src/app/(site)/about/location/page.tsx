import { Bus, Car, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { navMetadata } from "@/lib/seo";

export const metadata = navMetadata("/about/location");

/** 오시는 길 — 주소·대중교통·주차 안내 (개편 검토: 본문에 주소·교통 정보 누락) */
export default function Page() {
  const { contact } = siteConfig;
  const rows = [
    {
      Icon: MapPin,
      label: "주소",
      value: contact.address
        ? `${contact.address} ${contact.addressDetail}`
        : `${contact.addressDetail} (도로명 주소 확인 후 게시)`,
    },
    {
      Icon: Phone,
      label: "연락처",
      value:
        [
          contact.phone && `전화 ${contact.phone}`,
          contact.fax && `팩스 ${contact.fax}`,
          contact.email && contact.email,
        ]
          .filter(Boolean)
          .join(" · ") || "확인 후 게시",
    },
    { Icon: Bus, label: "대중교통", value: "확인 후 게시" },
    { Icon: Car, label: "주차", value: "확인 후 게시" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex aspect-[16/9] items-center justify-center rounded-2xl border border-dashed border-border bg-muted text-sm text-muted-foreground">
        지도 영역 (지도 API 연동 예정 — ISSUES.md FEAT-012)
      </div>
      <dl className="divide-y divide-border rounded-2xl border border-border">
        {rows.map(({ Icon, label, value }) => (
          <div key={label} className="flex flex-col gap-1 p-5 sm:flex-row sm:gap-6">
            <dt className="flex w-32 shrink-0 items-center gap-2 font-semibold">
              <Icon className="size-4 text-primary" aria-hidden />
              {label}
            </dt>
            <dd className="text-muted-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">
        ※ 센터는 충남연구원 건물 2층에 위치하며, 충남연구원과 별도로 운영되는 독립 기관입니다.
      </p>
    </div>
  );
}
