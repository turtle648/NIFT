import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          <div className="relative w-64 h-64 mx-auto mb-8">
            {/* 404 이미지 - 깨진 기프티콘 이미지 */}
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center animate-float">
                  <div className="text-6xl font-bold text-primary">404</div>
                </div>
              </div>

              {/* 깨진 효과 */}
              <div className="absolute top-0 left-0 w-full h-full">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon points="0,50 30,30 45,85 65,15 100,50" fill="white" fillOpacity="0.1" />
                  <polygon points="0,0 40,40 20,100 80,60 100,0" fill="white" fillOpacity="0.1" />
                </svg>
              </div>

              {/* 작은 NFT 아이콘들 */}
              <div
                className="absolute -top-4 -right-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <span className="text-xl">🎁</span>
              </div>
              <div
                className="absolute -bottom-2 -left-2 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center animate-float"
                style={{ animationDelay: "1s" }}
              >
                <span className="text-lg">🎟️</span>
              </div>
              <div
                className="absolute top-1/2 right-0 transform translate-x-1/2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center animate-float"
                style={{ animationDelay: "1.5s" }}
              >
                <span className="text-base">🎨</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">페이지를 찾을 수 없습니다</h1>
          <p className="text-gray-500 mb-8 whitespace-nowrap">
            찾으시는 기프티콘이 만료되었거나 존재하지 않는 페이지입니다.
            <br />
            다른 상품을 둘러보시거나 홈으로 돌아가세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                홈으로 돌아가기
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link href="/articles">
                <Search className="h-4 w-4" />
                상품 둘러보기
              </Link>
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Button variant="ghost" asChild className="text-gray-500 text-sm">
              <Link href="javascript:history.back()" className="flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                이전 페이지로 돌아가기
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

