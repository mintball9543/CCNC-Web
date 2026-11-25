import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { ContentTableEditor } from "@/components/admin/content-table-editor";
import { OfficialDefaultNotice } from "@/components/admin/official-default-notice";
import {
  dismissOfficialUpdateAction,
  resetContentTableAction,
} from "@/lib/actions/content.actions";
import { requireAdmin } from "@/lib/auth/guard";
import { contentTableOf } from "@/lib/config/charts";
import { contentTableDefault } from "@/lib/content/content-tables";
import { hasNewOfficialTable, tableOfficialDiff } from "@/lib/content/official-updates";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const metadata = { title: "표 수정" };

export default function EditContentTablePage(props: PageProps<"/admin/charts/tables/[slug]">) {
  return (
    <AdminSuspense>
      <Content {...props} />
    </AdminSuspense>
  );
}

async function Content({ params }: PageProps<"/admin/charts/tables/[slug]">) {
  await requireAdmin();
  const config = contentTableOf((await params).slug);
  if (!config) notFound();
  const saved = await settingsRepository.findContentTable(config.slug);
  const official = contentTableDefault(config.slug);
  const ack = saved ? await settingsRepository.findOfficialAck("table", config.slug) : null;
  return (
    <>
      <AdminPageHeader title={`표 수정 — ${config.label}`} />
      {saved && (
        <OfficialDefaultNotice
          isNew={hasNewOfficialTable(config.slug, saved.value, ack)}
          diff={tableOfficialDiff(saved.value, official)}
          resetAction={resetContentTableAction}
          dismissAction={dismissOfficialUpdateAction}
          resetHidden={{ slug: config.slug }}
          dismissHidden={{ kind: "table", slug: config.slug }}
          source={official.source || undefined}
        />
      )}
      <ContentTableEditor
        table={saved?.value ?? contentTableDefault(config.slug)}
        config={config}
        updatedAt={saved?.updatedAt.getTime()}
      />
    </>
  );
}
