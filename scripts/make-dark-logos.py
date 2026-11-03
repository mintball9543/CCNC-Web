"""
CI 로고 다크모드 변형 생성 스크립트.

원본 CI의 국문/영문 텍스트(남색 #22313B, 회색 #55626B)만 밝은 색으로 치환하고
심볼(녹색 타일)은 원본 색을 그대로 유지한다. 원본 이미지는 투명 배경(RGBA)이어야 한다.

사용법:
  python3 scripts/make-dark-logos.py <원본 디렉터리> <출력 디렉터리>
    원본 디렉터리: horizontal.webp, vertical.png, symbol.png
"""
import sys
from pathlib import Path
from PIL import Image

NAVY = (34, 48, 60)
SLATE = (86, 98, 108)
NAVY_DARK = (241, 245, 249)   # slate-100
SLATE_DARK = (182, 194, 204)  # 밝은 회청색


def recolor_text(im: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    x0, y0, x1, y1 = box
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b, a = px[x, y]
            if a == 0 or max(r, g, b) - min(r, g, b) > 40:
                continue  # 투명 영역 또는 유채색(심볼) 픽셀은 유지
            lum = (r + g + b) / 3
            t = min(max((lum - NAVY[0] - 10) / (SLATE[0] - NAVY[0]), 0.0), 1.0)
            c = tuple(round(NAVY_DARK[i] * (1 - t) + SLATE_DARK[i] * t) for i in range(3))
            px[x, y] = (*c, a)
    return im


def main(src: Path, out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    h = Image.open(src / "horizontal.webp")
    h.save(out / "ccnc-logo-horizontal.webp", lossless=True)
    recolor_text(h, (690, 0, h.width, h.height)).save(out / "ccnc-logo-horizontal-dark.webp", lossless=True)

    v = Image.open(src / "vertical.png")
    v.save(out / "ccnc-logo-vertical.png", optimize=True)
    recolor_text(v, (0, 940, v.width, v.height)).save(out / "ccnc-logo-vertical-dark.png", optimize=True)

    s = Image.open(src / "symbol.png")
    s.save(out / "ccnc-symbol.png", optimize=True)


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
