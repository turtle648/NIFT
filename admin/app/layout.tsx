import type React from "react";
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // 원하는 weight만 추가
  variable: "--font-noto", // (옵션) Tailwind 연동용 변수명
});

export const metadata: Metadata = {
  title: "NFT 기프티콘샵 관리자",
  description: "NFT 기프티콘샵 관리자 페이지",
  generator: "v0.dev",
  icons: {
    icon: "../admin/favicon-admin.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSans.variable}>
      <body className={notoSans.variable}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-5">{children}</main>
        </div>
      </body>
    </html>
  );
}

import "./globals.css";
