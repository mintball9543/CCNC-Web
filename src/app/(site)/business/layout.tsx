import { SectionLayout } from "@/components/layout/section-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SectionLayout sectionKey="business">{children}</SectionLayout>;
}
