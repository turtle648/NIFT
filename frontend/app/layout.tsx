import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],  // 원하는 weight만 추가
  variable: "--font-noto",        // (옵션) Tailwind 연동용 변수명
})

export const metadata: Metadata = {
  title: "NFT 기프티콘 중고거래 NIFT",
  description: "안전하고 투명한 NFT 기반 기프티콘 중고거래 플랫폼",
  generator: 'v0.dev',
  icons: {
    icon: "/frontend/favicon-nft.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={notoSans.variable}>
      <body className={notoSans.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}



import './globals.css'
import ClientLayout from "../components/ClientLayout";

