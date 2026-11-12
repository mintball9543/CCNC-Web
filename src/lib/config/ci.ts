/**
 * CI 소개 페이지 데이터.
 * 내려받기 파일은 public/downloads/ 의 ZIP 하나뿐이다. (AI·SVG·PNG 각 6종: 가로형·세로형·심볼 × 투명/흰 배경)
 * CI 원본이 바뀌면 ZIP 파일을 같은 이름으로 교체한다.
 */
export const ciDownload = {
  href: "/downloads/CCNC_CI.zip",
  fileName: "CCNC_CI.zip",
  contents: [
    { format: "AI", description: "일러스트레이터 원본 (가로형·세로형·심볼, 투명/흰 배경)" },
    { format: "SVG", description: "벡터 이미지 (가로형·세로형·심볼, 투명/흰 배경)" },
    { format: "PNG", description: "이미지 파일 (가로형·세로형·심볼, 투명/흰 배경)" },
  ],
} as const;

/** CI 심볼·워드마크 구성 색상 (src/app/globals.css 의 --color-ci-* 와 동일) */
export const ciColors = [
  { name: "녹색 1", hex: "#3f9a72" },
  { name: "녹색 2", hex: "#5a8478" },
  { name: "회색", hex: "#6c7780" },
  { name: "녹색 3", hex: "#2ead6b" },
  { name: "원형 녹색", hex: "#16a05a" },
  { name: "녹색 4", hex: "#22bb5f" },
  { name: "녹색 5", hex: "#55c757" },
  { name: "라임", hex: "#88d23a" },
  { name: "글자 남색", hex: "#22313b" },
  { name: "영문 회색", hex: "#55626b" },
] as const;
