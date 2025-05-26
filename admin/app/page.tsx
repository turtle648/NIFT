"use client"

import type React from "react"

import { useEffect, useState } from "react"
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import DashboardStats from "@/components/dashboards/summary"
import RecentProducts from "@/components/dashboards/recent"
import SearchBar from "@/components/dashboards/search"

export default function Home() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 간단한 로딩 효과
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/products/search?term=${encodeURIComponent(searchTerm)}`)
    }
  }

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">데이터를 불러오는 중입니다...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="관리자 대시보드" description="NFT 기프티콘샵 관리 시스템에 오신 것을 환영합니다." />
        <Link href="/products/register">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ 상품 등록</Button>
        </Link>
      </div>

      <SearchBar />
      <DashboardStats />
      <RecentProducts />
    </div>
  )
}

