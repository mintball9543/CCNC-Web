import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { mainNavigation } from "@/lib/config/navigation";

export const metadata: Metadata = { title: "사이트맵", alternates: { canonical: "/sitemap" } };

export default function Page() {
  return (
    <Container className="py-12">
      <h1 className="mb-8 text-3xl font-bold">사이트맵</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {mainNavigation.map((section) => (
          <section key={section.key} className="rounded-2xl border border-border p-5">
            <h2 className="mb-3 border-b-2 border-primary pb-2 font-bold">{section.title}</h2>
            <ul className="space-y-2 text-sm">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground hover:text-primary">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
