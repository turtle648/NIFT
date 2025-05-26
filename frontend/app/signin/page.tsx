"use client"

import Image from "next/image"
import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card } from "@/components/ui/card"
import KakaoLoginButton from "@/components/KakaoLoginButton"

export default function SigninPage() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="flex-1 py-12">
        <div className="container grid lg:grid-cols-2 min-h-[calc(100vh-16rem)] items-center gap-8">
          {/* 왼쪽: NFT 일러스트레이션 */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4 text-[#e05d55]">NFT 기프티콘 중고거래</h1>
              <p className="text-gray-600 max-w-md">
                블록체인 기술로 안전하게 보관하고 <br />거래할 수 있는 NFT 기프티콘을 만나보세요
              </p>
            </div>
            <div className="relative w-80 h-80 animate-float">
              <div
                className="relative transform transition-transform duration-300"
                style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Image
                  src="/santa.png"
                  alt="NFT 기프티콘 일러스트레이션"
                  width={300}
                  height={300}
                  className="object-contain"
                  priority
                />
                <div className="absolute inset-0 bg-[#e05d55] opacity-10 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 로그인 섹션 */}
          <div className="w-full max-w-md mx-auto">
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-3">
                  <span className="text-[#e05d55]">NIFT</span> 로그인
              </h2>
                <p className="text-gray-600">
                  간편하게 로그인하고
                  <br />
                  다양한 서비스를 이용해보세요.
                </p>
              </div>

              <div className="space-y-5">
                <KakaoLoginButton />
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

