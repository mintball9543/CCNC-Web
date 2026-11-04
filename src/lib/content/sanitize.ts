import sanitizeHtml from "sanitize-html";

/**
 * 게시글 본문 HTML 살균 — 편집기에서 만들 수 있는 태그·속성만 허용한다.
 * 저장 시와 출력 시 모두 적용한다(이중 방어).
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "hr",
    "h2",
    "h3",
    "h4",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        ...(attribs.href && /^https?:\/\//.test(attribs.href)
          ? { target: "_blank", rel: "noopener noreferrer nofollow" }
          : {}),
      },
    }),
  },
};

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS).trim();
}

/** 본문의 첫 번째 이미지 주소 (대표 이미지용) */
export function extractFirstImage(html: string): string | null {
  const match = /<img[^>]*\ssrc="([^"]+)"/i.exec(html);
  return match ? match[1].replace(/&amp;/g, "&") : null;
}

/** HTML → 요약용 일반 텍스트 */
export function htmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

/** 내용이 비어 있는지 (이미지만 있는 경우는 내용 있음으로 판단) */
export function isEmptyHtml(html: string): boolean {
  return htmlToText(html).length === 0 && !/<img/i.test(html);
}
