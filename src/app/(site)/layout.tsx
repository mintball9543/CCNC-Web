import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { getVisibleNavigation } from "@/lib/queries/site";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const navigation = await getVisibleNavigation();
  return (
    <>
      <SkipLink />
      <SiteHeader navigation={navigation} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
