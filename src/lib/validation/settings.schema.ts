import { z } from "zod";
import { MAX_SERIES } from "@/lib/charts/limits";
import { chartPlacementOf } from "@/lib/config/charts";
import { checkbox, optionalLink, optionalText } from "./common";

const text = (max: number) => z.string().trim().max(max, `${max}자 이내로 입력하세요.`).default("");
const order = z.coerce.number().int().min(0).max(999).default(0);

/** 기관 연락처 (푸터·오시는 길) */
export const contactSchema = z.object({
  address: text(200),
  addressDetail: text(100),
  postalCode: text(10),
  phone: text(30),
  fax: text(30),
  email: z.union([z.literal(""), z.email("올바른 이메일 주소를 입력하세요.")]).default(""),
  transit: text(1000),
  parking: text(1000),
});

/** 조직도 구성원 */
export const orgMemberSchema = z.object({
  department: z.string().trim().min(1, "소속을 입력하세요.").max(50),
  position: z.string().trim().min(1, "직위를 입력하세요.").max(50),
  name: z.string().trim().min(1, "이름을 입력하세요.").max(30),
  duties: text(500),
  phone: optionalText(30),
  email: z
    .string()
    .trim()
    .nullish()
    .transform((v) => v || null)
    .refine(
      (v) => v === null || z.email().safeParse(v).success,
      "올바른 이메일 주소를 입력하세요.",
    ),
  isHead: checkbox,
  isVisible: checkbox,
  sortOrder: order,
});

const jsonField = <T extends z.ZodType>(schema: T, message: string) =>
  z.string().transform((value, ctx) => {
    try {
      const parsed = schema.safeParse(JSON.parse(value));
      if (parsed.success) return parsed.data as z.infer<T>;
    } catch {
      /* fallthrough */
    }
    ctx.addIssue({ code: "custom", message });
    return z.NEVER;
  });

/** 관리자 입력 도표 */
export const chartSchema = z
  .object({
    title: z.string().trim().min(1, "제목을 입력하세요.").max(100),
    /** 표시할 페이지(메뉴) — 빈 값이면 어느 페이지에도 넣지 않음 (내부 키는 서버에서 정함) */
    placement: z
      .string()
      .trim()
      .default("")
      .refine((v) => v === "" || chartPlacementOf(v) !== null, "표시 위치를 다시 선택하세요."),
    description: text(300),
    unit: text(30),
    chartType: z.enum(["bar", "line", "stacked"]),
    categoryLabel: z.string().trim().min(1).max(20).default("연도"),
    series: jsonField(
      z.array(z.string().trim().min(1).max(30)).min(1).max(MAX_SERIES),
      `계열 이름을 1~${MAX_SERIES}개 입력하세요.`,
    ),
    rows: jsonField(
      z
        .array(
          z.object({
            label: z.string().trim().min(1).max(30),
            values: z.array(z.number().nullable()),
          }),
        )
        .max(100),
      "표 데이터 형식이 올바르지 않습니다.",
    ),
    source: text(200),
    sourceUrl: optionalLink,
    isPublished: checkbox,
    showOnHome: checkbox,
    sortOrder: order,
  })
  .refine((v) => v.rows.every((r) => r.values.length === v.series.length), {
    message: "각 행의 값 개수가 계열 수와 같아야 합니다.",
    path: ["rows"],
  })
  .refine((v) => !v.isPublished || v.source.length > 0, {
    message: "공개하려면 출처를 입력하세요. (공식 자료만 게시)",
    path: ["source"],
  });

/** 숫자로 보는 센터 */
export const statSchema = z.object({
  label: z.string().trim().min(1, "항목명을 입력하세요.").max(40),
  value: z.coerce
    .number({ error: "숫자를 입력하세요." })
    .int("정수로 입력하세요.")
    .min(0)
    .max(999_999_999),
  unit: text(10),
  description: text(80),
  isVisible: checkbox,
  sortOrder: order,
});

/** 메인 비주얼 슬라이드 */
export const heroSlideSchema = z.object({
  imageUrl: z
    .string()
    .trim()
    .min(1, "이미지를 올려 주세요.")
    .refine(
      (v) => /^\/files\/\d+$/.test(v) || /^https:\/\//.test(v),
      "업로드한 이미지 또는 https 주소만 사용할 수 있습니다.",
    ),
  imageAlt: z.string().trim().min(1, "사진 설명(대체 텍스트)을 입력하세요.").max(200),
  title: text(80),
  subtitle: text(200),
  linkUrl: optionalLink,
  /** 활동 갤러리 게시글에서 가져온 경우 연동 */
  postId: z
    .string()
    .nullish()
    .transform((v) => (v && /^\d+$/.test(v) ? Number(v) : null)),
  isActive: checkbox,
  sortOrder: order,
});

/** 하단 관련 기관 사이트 */
export const relatedSiteSchema = z.object({
  name: z.string().trim().min(1, "기관명을 입력하세요.").max(60),
  url: z
    .string()
    .trim()
    .refine((v) => /^https?:\/\/[^\s]+$/.test(v), "http(s):// 로 시작하는 주소를 입력하세요."),
  logoUrl: z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null))
    .refine(
      (v) =>
        v === null ||
        /^\/files\/\d+$/.test(v) ||
        /^\/related-sites\/[\w.-]+$/.test(v) ||
        /^https:\/\//.test(v),
      "로고는 업로드한 이미지 또는 https 주소만 사용할 수 있습니다.",
    ),
  isVisible: checkbox,
  sortOrder: order,
});

/** 관리자 비밀번호 변경 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력하세요."),
    newPassword: z.string().min(10, "새 비밀번호는 10자 이상이어야 합니다.").max(200),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "새 비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });
