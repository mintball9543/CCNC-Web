import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenCheck,
  Calculator,
  FileSearch,
  HandHeart,
  Landmark,
  Megaphone,
  Network,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import type { NavSection } from "@/types";

const icons: Record<string, { Icon: LucideIcon; desc?: string }> = {
  "/business/policy": { Icon: Landmark, desc: "지역 탄소중립 정책 수립·이행 지원" },
  "/business/research": { Icon: FileSearch, desc: "온실가스 현황 및 감축 연구" },
  "/business/education": { Icon: Megaphone, desc: "도민 대상 탄소중립 교육·홍보" },
  "/business/network": { Icon: Network, desc: "민·관·산·학 협력체계 운영" },
  "/participation/practice-group": { Icon: Users },
  "/participation/upsyu": { Icon: HandHeart },
  "/participation/footprint": { Icon: Calculator },
  "/participation/instructors": { Icon: BookOpenCheck },
};

/** 주요사업 바로가기 + 참여 프로그램 — 관리자가 숨긴 메뉴는 표시하지 않는다 */
export function QuickLinks({ navigation }: { navigation: NavSection[] }) {
  const business = navigation.find((s) => s.key === "business");
  const participation = navigation.find((s) => s.key === "participation");
  if (!business && !participation) return null;

  return (
    <Container className="grid gap-12 py-16 lg:grid-cols-5">
      {business && (
        <section
          aria-labelledby="business-heading"
          className={participation ? "lg:col-span-3" : "lg:col-span-5"}
        >
          <h2 id="business-heading" className="text-2xl font-bold">
            {business.title}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {business.items.map(({ title, href }) => {
              const { Icon, desc } = icons[href] ?? { Icon: Landmark };
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-md"
                  >
                    <Icon className="size-8 text-primary" aria-hidden />
                    <span className="mt-4 flex items-center gap-1 text-lg font-semibold">
                      {title}
                      <ArrowUpRight
                        className="size-4 opacity-0 transition group-hover:opacity-100"
                        aria-hidden
                      />
                    </span>
                    {desc && <span className="mt-1 text-sm text-muted-foreground">{desc}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {participation && (
        <section
          aria-labelledby="program-heading"
          className={business ? "lg:col-span-2" : "lg:col-span-5"}
        >
          <h2 id="program-heading" className="text-2xl font-bold">
            {participation.title}
          </h2>
          <ul className="mt-6 space-y-3">
            {participation.items.map(({ title, href }) => {
              const { Icon } = icons[href] ?? { Icon: Users };
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-4 rounded-2xl bg-primary-soft px-5 py-4 font-medium transition hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon className="size-6 shrink-0" aria-hidden />
                    {title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </Container>
  );
}
