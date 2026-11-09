import { describe, expect, it } from "vitest";
import { rangeBetween } from "./range-select";

describe("rangeBetween", () => {
  it("위에서 아래로", () => {
    expect(rangeBetween(0, 3)).toEqual([0, 1, 2, 3]);
  });
  it("아래에서 위로", () => {
    expect(rangeBetween(4, 1)).toEqual([1, 2, 3, 4]);
  });
  it("같은 행", () => {
    expect(rangeBetween(2, 2)).toEqual([2]);
  });
});
