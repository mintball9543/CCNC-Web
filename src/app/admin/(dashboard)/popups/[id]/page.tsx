import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSuspense } from "@/components/admin/admin-suspense";
import { PopupForm } from "@/components/admin/popup-form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deletePopupAction } from "@/lib/actions/popup.actions";
import { requireAdmin } from "@/lib/auth/guard";
import * as popupRepository from "@/lib/repositories/popup.repository";

export const metadata = { title: "팝업 수정" };

export default function EditPopupPage(props: PageProps<"/admin/popups/[id]">) {
  return (
    <AdminSuspense>
      <Content {...props} />
    </AdminSuspense>
  );
}

async function Content({ params }: PageProps<"/admin/popups/[id]">) {
  await requireAdmin();
  const popup = await popupRepository.findPopup(Number((await params).id));
  if (!popup) notFound();
  return (
    <>
      <AdminPageHeader
        title="팝업 수정"
        actions={
          <form action={deletePopupAction.bind(null, popup.id)}>
            <ConfirmSubmitButton message="이 팝업을 삭제하시겠습니까?">삭제</ConfirmSubmitButton>
          </form>
        }
      />
      <PopupForm popup={popup} />
    </>
  );
}
