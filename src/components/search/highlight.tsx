import { highlightSegments } from "@/lib/search/terms";

/** 검색어 부분을 <mark> 로 표시 */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlightSegments(text, terms).map((segment, i) =>
        segment.match ? (
          <mark key={i} className="rounded-sm bg-primary/15 text-inherit">
            {segment.text}
          </mark>
        ) : (
          segment.text
        ),
      )}
    </>
  );
}
