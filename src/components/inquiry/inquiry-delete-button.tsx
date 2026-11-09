"use client";

import { useActionState } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deleteOwnInquiryAction } from "@/lib/actions/inquiry.actions";
import { initialActionState } from "@/types";

/** 작성자 본인의 문의 삭제 (답변 전까지만) */
export function InquiryDeleteButton({
  id,
  currentPassword,
}: {
  id: number;
  currentPassword?: string;
}) {
  const [state, action] = useActionState(deleteOwnInquiryAction, initialActionState);
  return (
    <ActionForm action={action} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      {currentPassword && <input type="hidden" name="currentPassword" value={currentPassword} />}
      <ConfirmSubmitButton
        message="이 문의를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
        size="md"
      >
        삭제
      </ConfirmSubmitButton>
      {state.message && !state.ok && (
        <p className="text-xs text-danger" role="alert">
          {state.message}
        </p>
      )}
    </ActionForm>
  );
}
