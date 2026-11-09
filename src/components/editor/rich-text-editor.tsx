"use client";

import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { EditorView } from "@tiptap/pm/view";
import { isImageFile, isImageUrl, uploadFile } from "@/lib/uploads/client";
import { cn } from "@/lib/utils/cn";
import { applyImageSizePreset, IMAGE_SIZE_PRESETS, ResizableImage } from "./resizable-image";

interface RichTextEditorProps {
  /** form 에 전송될 hidden input 이름 */
  name: string;
  defaultValue?: string;
  placeholder?: string;
  invalid?: boolean;
  /** 이미지가 아닌 파일(PDF·HWP 등)을 끌어 놓았을 때 — 첨부파일 칸으로 전달 */
  onNonImageFiles?: (files: File[]) => void;
}

/**
 * 게시글 본문 편집기 (Tiptap).
 * - 이미지: 툴바 버튼 / 드래그 앤 드롭 / 클립보드 붙여넣기 → 업로드 후 본문에 삽입
 * - 이미지 주소(URL) 붙여넣기 → 이미지로 자동 변환 (노션 방식)
 * - 사진 크기 조절: 사진을 누르고 모서리를 끌거나, 툴바의 '작게·보통·크게·원래 크기' 선택
 * - 저장되는 HTML 은 서버에서 다시 살균된다.
 */
export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder,
  invalid,
  onNonImageFiles,
}: RichTextEditorProps) {
  const [html, setHtml] = useState(defaultValue);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 편집기 설정(editorProps)은 한 번만 만들어지므로 최신 콜백은 ref 로 전달
  const nonImageRef = useRef(onNonImageFiles);
  useEffect(() => {
    nonImageRef.current = onNonImageFiles;
  }, [onNonImageFiles]);

  async function insertImages(view: EditorView, files: File[], pos?: number) {
    setError(null);
    for (const file of files) {
      setBusy((n) => n + 1);
      try {
        const uploaded = await uploadFile(file, "image");
        const node = view.state.schema.nodes.image.create({
          src: uploaded.url,
          alt: file.name.replace(/\.[^.]+$/, ""),
        });
        const { tr, doc } = view.state;
        // replaceRangeWith 는 블록 노드를 문단 안이 아닌 알맞은 위치(문단 사이)에 넣는다
        view.dispatch(
          pos === undefined
            ? tr.replaceSelectionWith(node).scrollIntoView()
            : tr.replaceRangeWith(
                Math.min(pos, doc.content.size),
                Math.min(pos, doc.content.size),
                node,
              ),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "이미지 업로드에 실패했습니다.");
      } finally {
        setBusy((n) => n - 1);
      }
    }
  }

  function splitFiles(list: FileList | null | undefined) {
    const files = Array.from(list ?? []);
    return { images: files.filter(isImageFile), others: files.filter((f) => !isImageFile(f)) };
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      ResizableImage,
      Placeholder.configure({
        placeholder:
          placeholder ?? "내용을 입력하세요. 이미지는 끌어다 놓거나 붙여넣을 수 있습니다.",
      }),
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-ccnc min-h-80 px-4 py-3 focus:outline-none",
        "aria-label": "본문",
        role: "textbox",
        "aria-multiline": "true",
      },
      handleDrop(view, event, _slice, moved) {
        if (moved) return false;
        const { images, others } = splitFiles(event.dataTransfer?.files);
        if (images.length === 0 && others.length === 0) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        if (others.length) nonImageRef.current?.(others);
        if (images.length) void insertImages(view, images, pos);
        return true;
      },
      handlePaste(view, event) {
        const { images, others } = splitFiles(event.clipboardData?.files);
        if (images.length || others.length) {
          event.preventDefault();
          if (others.length) nonImageRef.current?.(others);
          if (images.length) void insertImages(view, images);
          return true;
        }
        const text = event.clipboardData?.getData("text/plain").trim() ?? "";
        if (!/^https?:\/\/\S+$/i.test(text)) return false;
        event.preventDefault();
        void isImageUrl(text).then((isImage) => {
          const { schema, tr } = view.state;
          view.dispatch(
            isImage
              ? tr
                  .replaceSelectionWith(schema.nodes.image.create({ src: text, alt: "" }))
                  .scrollIntoView()
              : tr.replaceSelectionWith(
                  schema.text(text, [schema.marks.link.create({ href: text })]),
                  false,
                ),
          );
        });
        return true;
      },
    },
  });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-card focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30",
        invalid ? "border-danger" : "border-border",
      )}
    >
      <input type="hidden" name={name} value={html} />
      <Toolbar editor={editor} onPickImage={() => fileInputRef.current?.click()} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (editor && files.length) void insertImages(editor.view, files);
          e.target.value = "";
        }}
      />
      <EditorContent editor={editor} />
      {(busy > 0 || error) && (
        <p
          className={cn(
            "border-t border-border px-4 py-2 text-xs",
            error ? "text-danger" : "text-muted-foreground",
          )}
          role="status"
        >
          {busy > 0 ? `이미지 업로드 중… (${busy})` : error}
        </p>
      )}
    </div>
  );
}

function Toolbar({ editor, onPickImage }: { editor: Editor | null; onPickImage: () => void }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
            image: e.isActive("image"),
            imageWidth: (e.isActive("image") ? e.getAttributes("image").width : null) as
              number | null,
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });
  if (!editor || !state) return <div className="h-11 border-b border-border bg-muted/50" />;
  const chain = () => editor.chain().focus();

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 주소 (비우면 링크 해제)", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url === "https://") chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/50 px-2 py-1.5"
      role="toolbar"
      aria-label="서식"
    >
      <ToolButton label="굵게" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <Bold />
      </ToolButton>
      <ToolButton label="기울임" active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <Italic />
      </ToolButton>
      <ToolButton
        label="밑줄"
        active={state.underline}
        onClick={() => chain().toggleUnderline().run()}
      >
        <Underline />
      </ToolButton>
      <ToolButton label="취소선" active={state.strike} onClick={() => chain().toggleStrike().run()}>
        <Strikethrough />
      </ToolButton>
      <Divider />
      <ToolButton
        label="제목 2"
        active={state.h2}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </ToolButton>
      <ToolButton
        label="제목 3"
        active={state.h3}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 />
      </ToolButton>
      <ToolButton
        label="글머리 목록"
        active={state.bullet}
        onClick={() => chain().toggleBulletList().run()}
      >
        <List />
      </ToolButton>
      <ToolButton
        label="번호 목록"
        active={state.ordered}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolButton>
      <ToolButton
        label="인용"
        active={state.quote}
        onClick={() => chain().toggleBlockquote().run()}
      >
        <Quote />
      </ToolButton>
      <Divider />
      <ToolButton label="링크" active={state.link} onClick={setLink}>
        <Link2 />
      </ToolButton>
      <ToolButton label="이미지 올리기" onClick={onPickImage}>
        <ImagePlus />
      </ToolButton>
      <Divider />
      {state.image && (
        <>
          <span
            className="flex items-center gap-1"
            role="group"
            aria-label="사진 크기"
            title="사진 모서리의 손잡이를 끌어서도 크기를 바꿀 수 있습니다."
          >
            <span className="px-1 text-xs text-muted-foreground">
              사진 크기{state.imageWidth ? ` ${state.imageWidth}px` : ""}
            </span>
            {IMAGE_SIZE_PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyImageSizePreset(editor, p.key)}
                className={cn(
                  "h-7 rounded-md border border-border bg-background px-2 text-xs transition hover:border-primary hover:text-primary",
                  p.key === "original" && !state.imageWidth && "border-primary text-primary",
                )}
              >
                {p.label}
              </button>
            ))}
          </span>
          <Divider />
        </>
      )}
      <ToolButton label="실행 취소" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
        <Undo2 />
      </ToolButton>
      <ToolButton label="다시 실행" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 />
      </ToolButton>
    </div>
  );
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-background hover:text-foreground disabled:opacity-40 [&_svg]:size-4",
        active && "bg-background text-primary shadow-sm",
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-border" aria-hidden />;
