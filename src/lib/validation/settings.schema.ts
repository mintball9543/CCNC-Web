import { z } from "zod";
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
  department: text(50),
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
  kind: z.enum(["staff", "support"]).default("staff"),
  isHead: checkbox,
  isVisible: checkbox,
  sortOrder: order,
});

/** 운영위원회 위원 */
export const committeeMemberSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력하세요.").max(30),
  organization: z.string().trim().min(1, "소속을 입력하세요.").max(80),
  position: text(50),
  note: text(200),
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

const chartRows = z
  .array(
    z.object({
      label: z.string().trim().min(1).max(30),
      values: z.array(z.number().nullable()),
    }),
  )
  .max(100);

/** 도표 항목 */
const chartFields = {
  title: z.string().trim().min(1, "제목을 입력하세요.").max(100),
  description: text(300),
  notes: text(1000),
  unit: text(30),
  chartType: z.enum(["bar", "line", "stacked"]),
  categoryLabel: z.string().trim().min(1).max(20).default("연도"),
  source: text(200),
  sourceUrl: optionalLink,
};

const rowsMatchSeries = (v: { series: string[]; rows: { values: unknown[] }[] }) =>
  v.rows.every((r) => r.values.length === v.series.length);
const rowsMatchSeriesError = {
  message: "각 행의 값 개수가 계열 수와 같아야 합니다.",
  path: ["rows"],
};

/**
 * 홈페이지에 고정된 도표·자료 (페이지 코드가 직접 사용).
 * 표시 위치·공개 여부는 바꿀 수 없고, 계열 고정 자료는 서버에서 계열을 다시 확인한다.
 */
export const systemChartSchema = z
  .object({
    ...chartFields,
    series: jsonField(
      z.array(z.string().trim().min(1).max(30)).min(1).max(12),
      "계열 이름을 1~12개 입력하세요.",
    ),
    rows: jsonField(
      chartRows.min(1, "1행 이상 입력하세요."),
      "표 데이터 형식이 올바르지 않습니다.",
    ),
  })
  .refine(rowsMatchSeries, rowsMatchSeriesError);

/** 홈페이지 글자 표 (관리자 > 도표 관리 > 표) */
export const contentTableSchema = z
  .object({
    title: z.string().trim().min(1, "소제목을 입력하세요.").max(100),
    description: text(300),
    caption: z.string().trim().min(1, "표 제목을 입력하세요.").max(150),
    unit: text(30),
    head: jsonField(
      z.array(z.string().trim().max(30)).min(2).max(12),
      "머리글은 2~12칸이어야 합니다.",
    ),
    rows: jsonField(
      z
        .array(
          z.object({
            cells: z.array(z.string().trim().max(100)),
            style: z.enum(["", "header", "row"]),
          }),
        )
        .min(1, "1행 이상 입력하세요.")
        .max(60),
      "표 데이터 형식이 올바르지 않습니다.",
    ),
    notes: text(1000),
    source: text(200),
  })
  .refine((v) => v.rows.every((r) => r.cells.length === v.head.length), {
    message: "각 행의 칸 수가 머리글 칸 수와 같아야 합니다.",
    path: ["rows"],
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
