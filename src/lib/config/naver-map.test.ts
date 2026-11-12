import { describe, expect, it } from "vitest";
import { naverMapScriptSrc, naverMapSearchUrl, resolveNaverMapConfig } from "./naver-map";

describe("resolveNaverMapConfig", () => {
  it("Client ID 가 없으면 null", () => {
    expect(resolveNaverMapConfig({})).toBeNull();
    expect(resolveNaverMapConfig({ NAVER_MAP_CLIENT_ID: "  " })).toBeNull();
  });
  it("좌표가 올바를 때만 center 를 쓴다", () => {
    expect(
      resolveNaverMapConfig({
        NAVER_MAP_CLIENT_ID: "abc",
        NAVER_MAP_LAT: "36.6",
        NAVER_MAP_LNG: "126.6",
      }),
    ).toEqual({ clientId: "abc", center: { lat: 36.6, lng: 126.6 } });
    expect(
      resolveNaverMapConfig({
        NAVER_MAP_CLIENT_ID: "abc",
        NAVER_MAP_LAT: "x",
        NAVER_MAP_LNG: "126.6",
      })?.center,
    ).toBeNull();
    expect(
      resolveNaverMapConfig({ NAVER_MAP_CLIENT_ID: "abc", NAVER_MAP_LAT: "36.6" })?.center,
    ).toBeNull();
  });
});

describe("naverMapScriptSrc", () => {
  it("좌표가 없으면 geocoder 서브모듈을 함께 불러온다", () => {
    expect(naverMapScriptSrc({ clientId: "a b", center: null })).toBe(
      "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=a+b&submodules=geocoder",
    );
    expect(naverMapScriptSrc({ clientId: "abc", center: { lat: 1, lng: 2 } })).toBe(
      "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=abc",
    );
  });
});

it("naverMapSearchUrl 은 주소를 인코딩한다", () => {
  expect(naverMapSearchUrl("가 1-2")).toBe("https://map.naver.com/p/search/%EA%B0%80%201-2");
});
