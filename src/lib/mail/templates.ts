/** 메일 본문 템플릿 (순수 함수) */

/**
 * 메일 하단 CI 로고 — 메일에 첨부(inline)해 cid 로 참조한다(mailer.ts).
 * 외부 이미지 차단·사내 주소(localhost 등)와 관계없이 항상 보인다.
 */
export const MAIL_LOGO_CID = "ccnc-ci-logo";
export const MAIL_LOGO_FILE = "public/brand/ccnc-logo-mail.png";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface InquiryAnsweredMail {
  siteName: string;
  authorName: string;
  inquiryTitle: string;
  answer: string;
  inquiryUrl: string;
  isPrivate: boolean;
}

export function inquiryAnsweredMail(input: InquiryAnsweredMail) {
  const subject = `[${input.siteName}] 문의하신 「${input.inquiryTitle}」에 답변이 등록되었습니다`;
  const privateNote = input.isPrivate
    ? "비공개 문의는 작성 시 입력한 비밀번호로 확인할 수 있습니다."
    : "";
  const text = [
    `${input.authorName}님, 안녕하세요.`,
    `${input.siteName}에 남겨주신 문의에 답변이 등록되었습니다.`,
    "",
    `■ 문의 제목: ${input.inquiryTitle}`,
    "■ 답변",
    input.answer,
    "",
    `문의 확인: ${input.inquiryUrl}`,
    privateNote,
    "",
    "본 메일은 발신 전용입니다.",
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  const html = `<!doctype html><html lang="ko"><body style="font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#1f2a33;line-height:1.7;max-width:600px;margin:0 auto;padding:24px">
<p style="color:#0f7a44;font-weight:700;margin:0 0 16px">${escapeHtml(input.siteName)}</p>
<p>${escapeHtml(input.authorName)}님, 안녕하세요.<br>남겨주신 문의에 답변이 등록되었습니다.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
<tr><th style="text-align:left;width:90px;padding:8px;background:#f3f6f5;border:1px solid #dfe6e3">문의 제목</th><td style="padding:8px;border:1px solid #dfe6e3">${escapeHtml(input.inquiryTitle)}</td></tr>
<tr><th style="text-align:left;padding:8px;background:#f3f6f5;border:1px solid #dfe6e3;vertical-align:top">답변</th><td style="padding:8px;border:1px solid #dfe6e3;white-space:pre-line">${escapeHtml(input.answer)}</td></tr>
</table>
<p><a href="${escapeHtml(input.inquiryUrl)}" style="display:inline-block;background:#0f7a44;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px">문의 확인하기</a></p>
${privateNote ? `<p style="font-size:13px;color:#56636d">${escapeHtml(privateNote)}</p>` : ""}
<p style="font-size:12px;color:#56636d;margin-top:32px">본 메일은 발신 전용입니다.</p>
${mailFooter(input.siteName)}
</body></html>`;

  return { subject, text, html };
}

/** 하단 CI 로고 (서명 대신) */
function mailFooter(siteName: string) {
  return `<div style="margin-top:24px;padding-top:20px;border-top:1px solid #dfe6e3">
<img src="cid:${MAIL_LOGO_CID}" width="180" height="64" alt="${escapeHtml(siteName)}" style="display:block;border:0;width:180px;height:auto">
</div>`;
}
