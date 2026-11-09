import { describe, expect, it } from "vitest";
import { authorActionMode, canAuthorModify } from "./permissions";

const pub = { isPrivate: false, hasPassword: false, answered: false };
const priv = { isPrivate: true, hasPassword: true, answered: false };

describe("canAuthorModify", () => {
  it("답변 후에는 누구도 불가", () => {
    expect(
      canAuthorModify({ ...priv, answered: true }, { isOwnerBrowser: true, passwordOk: true }),
    ).toEqual({
      ok: false,
      reason: "answered",
    });
  });

  it("공개 문의: 작성 브라우저면 가능, 아니면 불가", () => {
    expect(canAuthorModify(pub, { isOwnerBrowser: true, passwordOk: false }).ok).toBe(true);
    expect(canAuthorModify(pub, { isOwnerBrowser: false, passwordOk: false })).toEqual({
      ok: false,
      reason: "owner-only",
    });
  });

  it("비공개 문의: 작성 브라우저라도 비밀번호 필요", () => {
    expect(canAuthorModify(priv, { isOwnerBrowser: true, passwordOk: false })).toEqual({
      ok: false,
      reason: "password-required",
    });
    expect(canAuthorModify(priv, { isOwnerBrowser: false, passwordOk: true }).ok).toBe(true);
  });

  it("비밀번호가 있는 이전 공개 문의는 비밀번호로도 가능", () => {
    const legacy = { isPrivate: false, hasPassword: true, answered: false };
    expect(canAuthorModify(legacy, { isOwnerBrowser: false, passwordOk: true }).ok).toBe(true);
    expect(canAuthorModify(legacy, { isOwnerBrowser: false, passwordOk: false }).ok).toBe(false);
  });
});

describe("authorActionMode", () => {
  it("버튼 표시 방식", () => {
    expect(authorActionMode(pub, true)).toBe("direct");
    expect(authorActionMode(pub, false)).toBe("none");
    expect(authorActionMode(priv, true)).toBe("password");
    expect(authorActionMode({ ...pub, answered: true }, true)).toBe("none");
  });
});
