import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { togglePopupAction } from "@/lib/actions/popup.actions";
import { requireAdmin } from "@/lib/auth/guard";
import * as popupRepository from "@/lib/repositories/popup.repository";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "팝업 관리" };

export default async function AdminPopupsPage() {
  await requireAdmin();
  const popups = await popupRepository.listAllPopups();

  return (
    <>
      <AdminPageHeader
        title="팝업 관리"
        description="메인 화면에 모달 형태로 표시되는 팝업의 사용 여부, 위치, 크기, 게시 기간을 관리합니다."
        actions={
          <ButtonLink href="/admin/popups/new">
            <Plus className="size-4" aria-hidden />새 팝업
          </ButtonLink>
        }
      />
      {popups.length === 0 ? (
        <EmptyState title="등록된 팝업이 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/60 text-left">
              <tr>
                <th scope="col" className="px-4 py-3">
                  제목
                </th>
                <th scope="col" className="px-4 py-3">
                  위치
                </th>
                <th scope="col" className="px-4 py-3">
                  크기
                </th>
                <th scope="col" className="px-4 py-3">
                  게시 기간
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  사용
                </th>
              </tr>
            </thead>
            <tbody>
              {popups.map((popup) => (
                <tr key={popup.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/popups/${popup.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {popup.title}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">
                      순서 {popup.sortOrder}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {popup.position === "center" ? "화면 중앙" : `X ${popup.left}, Y ${popup.top}`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {popup.width} × {popup.height ?? "auto"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {popup.startsAt ? formatDateTime(popup.startsAt) : "즉시"} ~{" "}
                    {popup.endsAt ? formatDateTime(popup.endsAt) : "계속"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <form
                      action={togglePopupAction.bind(null, popup.id, !popup.isActive)}
                      className="inline-flex items-center gap-2"
                    >
                      <Badge tone={popup.isActive ? "primary" : "neutral"}>
                        {popup.isActive ? "ON" : "OFF"}
                      </Badge>
                      <SubmitButton variant="secondary" size="sm" pendingText="…">
                        {popup.isActive ? "끄기" : "켜기"}
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
