/** 업로드 파일 공개 URL */
export const fileUrl = (id: number) => `/files/${id}`;
export const fileDownloadUrl = (id: number) => `/files/${id}?download=1`;
export const fileViewUrl = (id: number) => `/files/${id}/view`;
