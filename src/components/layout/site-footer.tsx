import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { footerLinks } from "@/lib/config/navigation";
import { siteConfig } from "@/lib/config/site";
import { relatedSites } from "@/lib/content/related-sites";
import { CopyrightYear } from "./copyright-year";

export function SiteFooter() {
  const { contact } = siteConfig;
  const contactLines = [
    contact.address
      ? `${contact.postalCode ? `(${contact.postalCode}) ` : ""}${contact.address} ${contact.addressDetail}`
      : null,
    [
      contact.phone && `TEL ${contact.phone}`,
      contact.fax && `FAX ${contact.fax}`,
      contact.email && `E-mail ${contact.email}`,
    ]
      .filter(Boolean)
      .join("  ·  ") || null,
  ].filter(Boolean);

  return (
    <footer className="mt-auto border-t border-border bg-footer">
      <Container className="py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Logo variant="horizontal" className="h-10" />
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      link.href === "/privacy" ? "font-bold text-primary" : "hover:underline"
                    }
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
            <address className="space-y-1 text-sm text-muted-foreground not-italic">
              {contactLines.length > 0 ? (
                contactLines.map((line) => <p key={line}>{line}</p>)
              ) : (
                <p>{contact.addressDetail} · 연락처는 공식 확인 후 게시됩니다.</p>
              )}
            </address>
          </div>

          <div className="lg:w-64">
            <h2 className="mb-2 text-sm font-medium">관련 사이트</h2>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {relatedSites.map((site) => (
                <li key={site.href}>
                  <a
                    href={site.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground hover:underline"
                  >
                    {site.title}
                    <span className="sr-only"> (새 창)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          Copyright © <CopyrightYear /> {siteConfig.copyrightHolder}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
