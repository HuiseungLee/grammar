import type { Metadata } from "next";
import "./globals.css";

/* eslint-disable @next/next/next-script-for-ga -- 사용자가 지정한 두 Analytics 태그를 문서 head에 그대로 둡니다. */

export const metadata: Metadata = {
  metadataBase: new URL("https://grammar.lhsstart.synology.me"),
  title: "수니기는 문법시간 | 국어 문법 개념과 학습 자료",
  description: "국어 문법의 원리를 예문과 문장 분석, Q&A로 차근차근 이해하는 학습 공간",
  alternates: { canonical: "/" },
  openGraph: {
    title: "수니기는 문법시간",
    description: "국어 문법의 원리를 예문과 문장 분석, Q&A로 차근차근 이해하는 학습 공간",
    url: "/",
    locale: "ko_KR",
    type: "website",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        {/* 구글 */}
        <meta name="google-adsense-account" content="ca-pub-3651546052793597" />
        {/* 애드센스 헤더 AMP 시작 */}
        <script
          async
          {...{ "custom-element": "amp-auto-ads" }}
          src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"
        />
        {/* 애드센스 헤더 AMP 끝 */}
        {/* 애드센스 시작 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3651546052793597"
          crossOrigin="anonymous"
        />
        {/* 애드센스 끝 */}
        {/* 애널리틱스 시작 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-PVPS1HPY49" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-PVPS1HPY49');`,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-L017VEJ2D9" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-L017VEJ2D9');`,
          }}
        />
        {/* 애널리틱스 끝 */}
        {/* 구글 끝 */}
      </head>
      <body>{children}</body>
    </html>
  );
}
