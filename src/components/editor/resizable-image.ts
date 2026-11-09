import type { Editor } from "@tiptap/core";
import Image from "@tiptap/extension-image";

/** 사진 최소 너비(px) — 너무 작게 줄여 사라지는 것을 막는다 */
export const MIN_IMAGE_WIDTH = 80;

/**
 * 크기 조절이 되는 본문 이미지.
 * - 사진을 누르면 네 모서리에 손잡이가 생기고, 끌어서 비율을 유지한 채 크기를 바꾼다.
 * - 크기는 <img width height> 속성으로 저장된다(살균 허용 속성). 공개 화면에서는 max-width:100% 로
 *   화면보다 크면 자동으로 줄어든다.
 * - Tiptap 기본 노드뷰는 width 속성이 바뀌어도(예: 툴바의 '작게·보통' 버튼) 화면을 다시 그리지 않으므로
 *   update 를 감싸 너비를 반영한다.
 */
export const ResizableImage = Image.extend({
  addNodeView() {
    const factory = this.parent?.();
    if (!factory) return null;
    return (props) => {
      const view = factory(props);
      const img = view.dom instanceof HTMLElement ? view.dom.querySelector("img") : null;
      const update = view.update?.bind(view);
      view.update = (node, decorations, innerDecorations) => {
        const updated = update ? update(node, decorations, innerDecorations) : false;
        if (updated && img && node.type === props.node.type) {
          const width = node.attrs.width as number | null;
          img.style.width = width ? `${width}px` : "";
          img.style.height = "";
        }
        return updated;
      };
      return view;
    };
  },
}).configure({
  inline: false,
  allowBase64: false,
  resize: {
    enabled: true,
    directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
    minWidth: MIN_IMAGE_WIDTH,
    minHeight: 30,
    alwaysPreserveAspectRatio: true,
  },
});

export type ImageSizePreset = "small" | "medium" | "large" | "original";

export const IMAGE_SIZE_PRESETS: { key: ImageSizePreset; label: string; ratio: number | null }[] = [
  { key: "small", label: "작게", ratio: 1 / 3 },
  { key: "medium", label: "보통", ratio: 1 / 2 },
  { key: "large", label: "크게", ratio: 1 },
  { key: "original", label: "원래 크기", ratio: null },
];

/** 본문 칸 너비 대비 비율로 선택한 사진의 크기를 바꾼다 (원래 크기 = 크기 지정 해제) */
export function applyImageSizePreset(editor: Editor, preset: ImageSizePreset) {
  const option = IMAGE_SIZE_PRESETS.find((p) => p.key === preset);
  if (!option || !editor.isActive("image")) return;
  if (option.ratio === null) {
    editor.chain().focus().updateAttributes("image", { width: null, height: null }).run();
    return;
  }
  const { from } = editor.state.selection;
  const dom = editor.view.nodeDOM(from);
  const img = dom instanceof HTMLElement ? (dom.querySelector("img") ?? dom) : null;
  const naturalWidth = img instanceof HTMLImageElement ? img.naturalWidth : 0;
  const naturalHeight = img instanceof HTMLImageElement ? img.naturalHeight : 0;

  const style = getComputedStyle(editor.view.dom);
  const contentWidth =
    editor.view.dom.clientWidth -
    parseFloat(style.paddingLeft || "0") -
    parseFloat(style.paddingRight || "0");
  let width = Math.max(MIN_IMAGE_WIDTH, Math.round(contentWidth * option.ratio));
  // 원본보다 크게 늘리면 흐려지므로 원본 크기까지만
  if (naturalWidth > 0) width = Math.min(width, naturalWidth);
  const height =
    naturalWidth > 0 && naturalHeight > 0
      ? Math.round((width * naturalHeight) / naturalWidth)
      : null;
  editor.chain().focus().updateAttributes("image", { width, height }).run();
}
