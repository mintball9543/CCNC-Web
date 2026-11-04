import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/** 업로드 저장 위치 (공개 폴더 밖 — 반드시 /files 라우트를 통해 제공) */
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "data", "uploads");

function resolveKey(storageKey: string): string {
  if (!/^[a-z0-9]+\.[a-z0-9]+$/i.test(storageKey)) throw new Error("잘못된 파일 키");
  return path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, storageKey);
}

export async function saveUpload(bytes: Uint8Array, extension: string): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const storageKey = `${randomBytes(16).toString("hex")}.${extension}`;
  await writeFile(resolveKey(storageKey), bytes);
  return storageKey;
}

export function readUpload(storageKey: string): Promise<Buffer> {
  return readFile(resolveKey(storageKey));
}

export async function removeUpload(storageKey: string): Promise<void> {
  await rm(resolveKey(storageKey), { force: true });
}
