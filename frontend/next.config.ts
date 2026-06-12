import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // フロントの /api/* を FastAPI バックエンド (:8000) へプロキシする。
  // 同一オリジンになるため CORS 設定が不要になる。
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
