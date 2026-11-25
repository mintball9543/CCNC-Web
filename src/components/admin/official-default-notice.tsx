import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";

/**
 * 도표·표 수정 화면 위 안내 — 저장된 값이 코드에 넣어 둔 최신 공식 값과 다르면
 * '최신 공식 값으로 바꾸기' 버튼을 보여 준다 (새 통계로 처음 값을 고친 뒤 DB 반영용).
 */
export function OfficialDefaultNotice({
  differs,
  action,
  hidden,
  source,
}: {
  differs: boolean;
  action: (formData: FormData) => Promise<void>;
  hidden: { name: string; value: string };
  /** 최신 공식 값의 출처 */
  source?: string;
}) {
  if (!differs) {
    return (
      <p className="mb-6 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
        지금 값이 홈페이지에 넣어 둔 최신 공식 자료와 같습니다.
      </p>
    );
  }
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/40 bg-primary-soft px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="leading-relaxed">
        <p className="font-semibold">저장된 값이 최신 공식 자료와 다릅니다.</p>
        <p className="mt-0.5 text-muted-foreground">
          {source ? `최신 공식 자료: ${source}. ` : ""}직접 고친 내용이 있다면 바꾸기 전에
          확인하세요.
        </p>
      </div>
      <form action={action} className="shrink-0">
        <input type="hidden" name={hidden.name} value={hidden.value} />
        <ConfirmSubmitButton
          variant="primary"
          message="지금 저장된 값을 지우고 최신 공식 자료로 바꿉니다. 계속할까요?"
        >
          최신 공식 값으로 바꾸기
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
