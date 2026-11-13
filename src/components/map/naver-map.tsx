"use client";

import Script from "next/script";
import { MapPin } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { naverMapScriptSrc, type NaverMapConfig } from "@/lib/config/naver-map";

/** 네이버 지도 JS API v3 중 이 화면에서 쓰는 부분만 타입으로 선언 */
interface NaverMapsApi {
  Map: new (el: HTMLElement, options: Record<string, unknown>) => { destroy?: () => void };
  LatLng: new (lat: number, lng: number) => unknown;
  Marker: new (options: Record<string, unknown>) => unknown;
  /** 서브모듈(geocoder 등)까지 모두 불러온 뒤 호출됨 */
  onJSContentLoaded?: () => void;
  Service?: {
    Status: { OK: unknown };
    geocode: (
      options: { query: string },
      callback: (
        status: unknown,
        response: { v2?: { addresses?: { x: string; y: string }[] } } | undefined,
      ) => void,
    ) => void;
  };
}

declare global {
  interface Window {
    naver?: { maps?: NaverMapsApi };
    /** 인증 실패(키 오류·등록되지 않은 도메인) 시 네이버 지도 스크립트가 호출 */
    navermap_authFailure?: () => void;
  }
}

type Status = "loading" | "ready" | "failed";

/** 서브모듈을 기다리는 최대 시간 — 넘으면 안내 문구로 전환 */
const SUBMODULE_TIMEOUT_MS = 10_000;

/**
 * 오시는 길 지도 (네이버 지도).
 * 좌표(NAVER_MAP_LAT/LNG)가 있으면 그 위치를, 없으면 기관 주소로 위치를 찾아 표시한다.
 * 키 오류·주소 검색 실패 시에는 안내 문구와 '네이버 지도에서 보기' 링크(아래)만 남는다.
 */
export function NaverMap({
  config,
  address,
  title,
}: {
  config: NaverMapConfig;
  address: string;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    window.navermap_authFailure = () => setStatus("failed");
    return () => {
      window.navermap_authFailure = undefined;
    };
  }, []);

  const draw = useCallback(() => {
    const maps = window.naver?.maps;
    const el = containerRef.current;
    if (!maps || !el) return setStatus("failed");
    const show = (lat: number, lng: number) => {
      const position = new maps.LatLng(lat, lng);
      el.replaceChildren();
      const map = new maps.Map(el, { center: position, zoom: 16, zoomControl: true });
      new maps.Marker({ position, map, title });
      setStatus("ready");
    };
    if (config.center) return show(config.center.lat, config.center.lng);
    if (!address || !maps.Service) return setStatus("failed");
    maps.Service.geocode({ query: address }, (result, response) => {
      const found = response?.v2?.addresses?.[0];
      if (result !== maps.Service?.Status.OK || !found) {
        // 403: Maps Application 에 Geocoding 이 선택되지 않음 → 콘솔에서 선택하거나 NAVER_MAP_LAT/LNG 지정
        console.warn(
          "[네이버 지도] 주소로 위치를 찾지 못했습니다. NAVER Cloud 콘솔의 Maps Application 에서 " +
            "'Geocoding' 을 선택했는지 확인하거나, .env 에 NAVER_MAP_LAT·NAVER_MAP_LNG 좌표를 지정하세요.",
        );
        return setStatus("failed");
      }
      show(Number(found.y), Number(found.x));
    });
  }, [address, config.center, title]);

  /**
   * maps.js 를 불러온 직후에는 geocoder 서브모듈(maps-geocoder.js)이 아직 오는 중이라
   * maps.Service 가 없다. 주소 검색이 필요하면 서브모듈까지 받은 뒤(onJSContentLoaded) 그린다.
   */
  const timerRef = useRef<number | undefined>(undefined);
  const start = useCallback(() => {
    const maps = window.naver?.maps;
    if (maps && !config.center && !maps.Service) {
      maps.onJSContentLoaded = () => {
        window.clearTimeout(timerRef.current);
        draw();
      };
      timerRef.current = window.setTimeout(
        () => setStatus((s) => (s === "loading" ? "failed" : s)),
        SUBMODULE_TIMEOUT_MS,
      );
      return;
    }
    draw();
  }, [config.center, draw]);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted sm:aspect-[16/9]">
      <Script src={naverMapScriptSrc(config)} onReady={start} onError={() => setStatus("failed")} />
      <div
        ref={containerRef}
        className="size-full"
        role="region"
        aria-label={`${title} 위치 지도`}
      />
      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
          <MapPin className="size-6 text-primary" aria-hidden />
          {status === "loading" ? (
            <p>지도를 불러오는 중입니다…</p>
          ) : (
            <p>
              지도를 표시할 수 없습니다. 아래 &lsquo;네이버 지도에서 보기&rsquo;를 이용해 주세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
