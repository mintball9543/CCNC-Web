import Link from "next/link";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { Container } from "@/components/ui/container";
import { footerLinks } from "@/lib/config/navigation";
import { siteConfig } from "@/lib/config/site";
import { getContactSettings, getRelatedSites } from "@/lib/queries/site";
import { CopyrightYear } from "./copyright-year";
import { RelatedSites } from "./related-sites";

/** 하단 — 관련 사이트·주소·연락처는 관리자 화면에서 수정 */
export async function SiteFooter() {
  const [contact, sites] = await Promise.all([getContactSettings(), getRelatedSites()]);
  const addressLine = contact.address
    ? `${contact.postalCode ? `(${contact.postalCode}) ` : ""}${contact.address} ${contact.addressDetail}`.trim()
    : contact.addressDetail;
  const contactLine = [
    contact.phone && `TEL ${contact.phone}`,
    contact.fax && `FAX ${contact.fax}`,
    contact.email && `E-mail ${contact.email}`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <footer className="mt-auto border-t border-border bg-footer">
      <Container className="py-10">
        <RelatedSites sites={sites} />
        <div className="flex flex-col gap-8 pt-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <BrandLockup compact />
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
              {addressLine && <p>{addressLine}</p>}
              {contactLine && <p>{contactLine}</p>}
            </address>
          </div>
        </div>

        <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          Copyright © <CopyrightYear /> {siteConfig.copyrightHolder}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
