const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/admin", // 💥 핵심: 경로 설정 추가
  assetPrefix: "/admin", // 💥 정적 파일 prefix 맞추기 (Next가 정적 리소스를 이 경로로 만듦)
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "http", hostname: "img1.kakaocdn.net" },
      { protocol: "http", hostname: "t1.kakaocdn.net" },
      { protocol: "https", hostname: "k.kakaocdn.net" },
      { protocol: "http", hostname: "k.kakaocdn.net" },
      { protocol: "https", hostname: "sitem.ssgcdn.com" },
      { protocol: "https", hostname: "static.megamart.com" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "example.com" },
      { protocol: "https", hostname: "p.kakaocdn.net" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;