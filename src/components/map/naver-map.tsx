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
  Service?: {
    Status: { OK: unknown };
    geocode: (
      options: { query: string },
      callback: (
        status: unknown,
        response: { v2?: { addresses?: { x: string; y: string }[] } },
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
      const found = response.v2?.addresses?.[0];
      if (result !== maps.Service?.Status.OK || !found) return setStatus("failed");
      show(Number(found.y), Number(found.x));
    });
  }, [address, config.center, title]);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted sm:aspect-[16/9]">
      <Script src={naverMapScriptSrc(config)} onReady={draw} onError={() => setStatus("failed")} />
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
