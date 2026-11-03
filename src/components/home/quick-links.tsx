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
} from "lucide-react";
import { Container } from "@/components/ui/container";

const businessLinks = [
  {
    title: "정책지원",
    href: "/business/policy",
    Icon: Landmark,
    desc: "지역 탄소중립 정책 수립·이행 지원",
  },
  {
    title: "조사연구",
    href: "/business/research",
    Icon: FileSearch,
    desc: "온실가스 현황 및 감축 연구",
  },
  {
    title: "교육·홍보",
    href: "/business/education",
    Icon: Megaphone,
    desc: "도민 대상 탄소중립 교육·홍보",
  },
  {
    title: "네트워크·거버넌스",
    href: "/business/network",
    Icon: Network,
    desc: "민·관·산·학 협력체계 운영",
  },
];

const programLinks = [
  { title: "탄소중립 생활실천단", href: "/participation/practice-group", Icon: Users },
  { title: "탄소업슈", href: "/participation/upsyu", Icon: HandHeart },
  { title: "탄소발자국 계산기", href: "/participation/footprint", Icon: Calculator },
  { title: "교육 강사단", href: "/participation/instructors", Icon: BookOpenCheck },
];

/** 주요사업 바로가기 + 참여 가능 프로그램 */
export function QuickLinks() {
  return (
    <Container className="grid gap-12 py-16 lg:grid-cols-5">
      <section aria-labelledby="business-heading" className="lg:col-span-3">
        <h2 id="business-heading" className="text-2xl font-bold">
          주요사업
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {businessLinks.map(({ title, href, Icon, desc }) => (
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
                <span className="mt-1 text-sm text-muted-foreground">{desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="program-heading" className="lg:col-span-2">
        <h2 id="program-heading" className="text-2xl font-bold">
          참여·실천
        </h2>
        <ul className="mt-6 space-y-3">
          {programLinks.map(({ title, href, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-4 rounded-2xl bg-primary-soft px-5 py-4 font-medium transition hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="size-6 shrink-0" aria-hidden />
                {title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
