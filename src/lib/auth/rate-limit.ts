/**
 * 간단한 메모리 기반 시도 횟수 제한 (단일 서버 기준).
 * 다중 서버로 확장 시 공유 저장소 기반으로 교체 필요 — ISSUES.md FEAT-006
 */
export class AttemptLimiter {
  private attempts = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly maxAttempts: number,
    private readonly windowMs: number,
  ) {}

  /** 차단 중이면 남은 시간(ms), 아니면 0 */
  blockedFor(key: string, now = Date.now()): number {
    const entry = this.attempts.get(key);
    if (!entry || entry.resetAt <= now) return 0;
    return entry.count >= this.maxAttempts ? entry.resetAt - now : 0;
  }

  fail(key: string, now = Date.now()): void {
    const entry = this.attempts.get(key);
    if (!entry || entry.resetAt <= now) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
    } else {
      entry.count += 1;
    }
    if (this.attempts.size > 10_000) this.prune(now);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  private prune(now: number) {
    for (const [key, entry] of this.attempts) if (entry.resetAt <= now) this.attempts.delete(key);
  }
}

const globalLimiters = globalThis as unknown as { __ccncLimiters?: Record<string, AttemptLimiter> };
globalLimiters.__ccncLimiters ??= {};

/** 이름별 공유 인스턴스 (개발 모드 HMR 에도 유지) */
export function getLimiter(name: string, maxAttempts: number, windowMs: number): AttemptLimiter {
  return (globalLimiters.__ccncLimiters![name] ??= new AttemptLimiter(maxAttempts, windowMs));
}
