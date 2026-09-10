import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://grammar.lhsstart.synology.me"),
  title: "수니기는 문법시간 | 국어 문법 개념과 학습 자료",
  description: "국어 문법의 원리를 예문과 확인 문제로 차근차근 이해하는 학습 공간",
  alternates: { canonical: "/" },
  openGraph: {
    title: "수니기는 문법시간",
    description: "국어 문법의 원리를 예문과 확인 문제로 차근차근 이해하는 학습 공간",
    url: "/",
    locale: "ko_KR",
    type: "website",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
