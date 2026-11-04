import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ContactForm } from "@/components/admin/contact-form";
import { PasswordForm } from "@/components/admin/password-form";
import { requireAdmin } from "@/lib/auth/guard";
import { siteConfig } from "@/lib/config/site";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "기관 정보·비밀번호" };

export default function SettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="기관 정보·비밀번호"
        description="하단(푸터)과 '오시는 길'에 표시되는 주소·연락처, 관리자 비밀번호를 관리합니다."
      />
      <AdminSuspense>
        <Content />
      </AdminSuspense>
    </>
  );
}

async function Content() {
  await requireAdmin();
  const saved = await settingsRepository.findContactSettings();
  return (
    <div className="space-y-12">
      <section>
        <h2 className="mb-4 text-lg font-bold">기관 정보</h2>
        <ContactForm contact={{ ...siteConfig.contactDefaults, ...saved }} />
      </section>
      <section className="border-t border-border pt-8">
        <h2 className="mb-4 text-lg font-bold">관리자 비밀번호 변경</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
