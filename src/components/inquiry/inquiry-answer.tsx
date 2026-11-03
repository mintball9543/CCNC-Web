import { MessageSquareReply } from "lucide-react";
import { formatDateTime } from "@/lib/utils/format";

export function InquiryAnswer({
  answer,
  answeredAt,
}: {
  answer: string | null;
  answeredAt: Date | null;
}) {
  if (!answer) {
    return (
      <p className="rounded-xl bg-muted px-5 py-6 text-center text-sm text-muted-foreground">
        담당자가 확인 후 답변드릴 예정입니다.
      </p>
    );
  }
  return (
    <section
      aria-labelledby="answer-heading"
      className="rounded-xl border border-primary/30 bg-primary-soft p-5"
    >
      <h3 id="answer-heading" className="mb-3 flex items-center gap-2 font-semibold text-primary">
        <MessageSquareReply className="size-4" aria-hidden />
        센터 답변
        {answeredAt && (
          <span className="text-xs font-normal text-muted-foreground">
            {formatDateTime(answeredAt)}
          </span>
        )}
      </h3>
      <p className="text-sm leading-relaxed whitespace-pre-line">{answer}</p>
    </section>
  );
}
