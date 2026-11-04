import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // libsql 네이티브 바인딩은 번들링하지 않고 런타임에 로드한다.
  serverExternalPackages: ["@libsql/client", "libsql"],
  turbopack: {
    // hwp.js(cfb) 의 Node 전용 fs 사용을 브라우저 번들에서 제외
    resolveAlias: {
      fs: { browser: "./src/lib/shims/empty-module.ts" },
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
