/** @type {import('next').NextConfig} */

// 포트폴리오 iframe 으로 삽입되는 외부 도메인
const PORTFOLIO_FRAME_ORIGINS = [
  "https://portfolio3-deploy.vercel.app",
  "https://portfolio2-deploy-tau.vercel.app",
  "https://portfolio4-gold-mu.vercel.app",
].join(" ");

const securityHeaders = [
  // Clickjacking 방지: 동일 출처에서만 iframe 허용
  { key: "X-Frame-Options", value: "SAMEORIGIN" },

  // MIME 스니핑 방지
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Referrer 정보 최소화
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // 불필요한 브라우저 기능 비활성화
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },

  // Content Security Policy
  // 참고: GSAP, Motion(Framer), Tailwind v4 동적 스타일로 인해
  //       'unsafe-inline' 이 필요합니다. nonce 방식은 별도 설정 필요.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
      "img-src 'self' data: blob:",
      // 포트폴리오 섹션 iframe 허용
      `frame-src 'self' ${PORTFOLIO_FRAME_ORIGINS}`,
      // API 요청은 동일 출처만 허용
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},

  async headers() {
    return [
      {
        // 모든 경로에 보안 헤더 적용
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
