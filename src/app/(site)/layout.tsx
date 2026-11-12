import { Suspense } from "react";
import { InquiryFab } from "@/components/layout/inquiry-fab";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { VisitTracker } from "@/components/layout/visit-tracker";
import { getVisibleNavigation } from "@/lib/queries/site";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const navigation = await getVisibleNavigation();
  const showInquiry = navigation.some((s) => s.items.some((i) => i.href === "/news/inquiry"));
  return (
    <>
      <SkipLink />
      <SiteHeader navigation={navigation} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      {showInquiry && <InquiryFab />}
      <Suspense>
        <VisitTracker />
      </Suspense>
    </>
  );
}
