"use client";

import { Images, Link2Off } from "lucide-react";
import { useActionState, useState, type ComponentProps } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Fresh } from "@/components/ui/fresh";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveHeroSlideAction } from "@/lib/actions/content.actions";
import { initialActionState, type HeroSlide } from "@/types";
import { ImageUploadField } from "./image-upload-field";

/** 활동 갤러리에서 가져올 수 있는 게시글 */
export interface GalleryPick {
  id: number;
  title: string;
  thumbnailUrl: string;
}

function HeroSlideFormInner({
  slide,
  galleryPosts = [],
}: {
  slide?: HeroSlide;
  galleryPosts?: GalleryPick[];
}) {
  const [state, action] = useActionState(saveHeroSlideAction, initialActionState);
  const err = (k: string) => state.fieldErrors?.[k];

  // 갤러리에서 가져오기로 한꺼번에 채우는 값은 상태로 관리
  const [imageUrl, setImageUrl] = useState(slide?.imageUrl ?? "");
  const [imageAlt, setImageAlt] = useState(slide?.imageAlt ?? "");
  const [title, setTitle] = useState(slide?.title ?? "");
  const [linkUrl, setLinkUrl] = useState(slide?.linkUrl ?? "");
  const [postId, setPostId] = useState<number | null>(slide?.postId ?? null);
  const linkedPost = galleryPosts.find((p) => p.id === postId);

  const pickFromGallery = (id: number) => {
    const post = galleryPosts.find((p) => p.id === id);
    if (!post) return;
    setPostId(post.id);
    setImageUrl(post.thumbnailUrl);
    setImageAlt(post.title);
    setTitle(post.title);
    setLinkUrl(`/news/gallery/${post.id}`);
  };

  return (
    <ActionForm action={action} className="max-w-3xl space-y-5">
      {slide && <input type="hidden" name="id" value={slide.id} />}
      <input type="hidden" name="postId" value={postId ?? ""} />
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <section className="space-y-2 rounded-xl border border-border bg-muted/40 p-4">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <Images className="size-4 text-primary" aria-hidden />
          활동 갤러리에서 가져오기
        </p>
        {galleryPosts.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            사진이 있는 활동 갤러리 게시글이 없습니다. 게시판 &gt; 활동 갤러리에 행사 사진을 올리면
            여기서 고를 수 있습니다.
          </p>
        ) : (
          <>
            <label htmlFor="gallery-pick" className="sr-only">
              활동 갤러리 게시글 선택
            </label>
            <Select
              id="gallery-pick"
              value={postId ?? ""}
              onChange={(e) =>
                e.target.value ? pickFromGallery(Number(e.target.value)) : setPostId(null)
              }
            >
              <option value="">직접 사진 올리기</option>
              {galleryPosts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              고른 게시글의 대표 사진·제목·링크가 채워지고, 게시글과 연동됩니다(게시글을 삭제하면
              슬라이드도 함께 삭제).
            </p>
          </>
        )}
        {postId && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 text-xs">
            <span>
              연동된 게시글: <strong>{linkedPost?.title ?? `#${postId}`}</strong>
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={() => setPostId(null)}>
              <Link2Off className="size-3.5" aria-hidden />
              연동 해제
            </Button>
          </div>
        )}
      </section>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">
          사진
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        </p>
        <ImageUploadField
          name="imageUrl"
          value={imageUrl}
          onChange={setImageUrl}
          invalid={!!err("imageUrl")}
        />
        {err("imageUrl")?.map((e) => (
          <p key={e} className="text-xs text-danger">
            {e}
          </p>
        ))}
        <p className="text-xs text-muted-foreground">
          가로로 긴 사진(1920×800 이상)을 권장합니다. 글자가 왼쪽 아래에 겹쳐 표시됩니다.
        </p>
      </div>
      <Field
        label="사진 설명 (대체 텍스트)"
        htmlFor="imageAlt"
        required
        errors={err("imageAlt")}
        hint="예: 2025 탄소중립 실천 다짐대회 단체 사진"
      >
        <Input
          id="imageAlt"
          name="imageAlt"
          value={imageAlt}
          onChange={(e) => setImageAlt(e.target.value)}
          required
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="큰 문구" htmlFor="title" errors={err("title")} hint="비우면 기본 문구">
          <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="작은 문구" htmlFor="subtitle" errors={err("subtitle")}>
          <Input id="subtitle" name="subtitle" defaultValue={slide?.subtitle} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <Field
          label="'자세히 보기' 링크"
          htmlFor="linkUrl"
          errors={err("linkUrl")}
          hint="예: /news/gallery/12"
        >
          <Input
            id="linkUrl"
            name="linkUrl"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </Field>
        <Field label="순서" htmlFor="sortOrder" errors={err("sortOrder")}>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={slide?.sortOrder ?? 0}
          />
        </Field>
      </div>
      <Checkbox name="isActive" defaultChecked={slide?.isActive ?? true} label="메인 화면에 표시" />
      <div className="flex gap-2 border-t border-border pt-5">
        <SubmitButton pendingText="저장 중…">{slide ? "수정" : "등록"}</SubmitButton>
        <ButtonLink href="/admin/hero" variant="secondary">
          취소
        </ButtonLink>
      </div>
    </ActionForm>
  );
}

export function HeroSlideForm(props: ComponentProps<typeof HeroSlideFormInner>) {
  return (
    <Fresh dataKey={props.slide?.updatedAt?.getTime()}>
      <HeroSlideFormInner {...props} />
    </Fresh>
  );
}
