"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArticleGrid } from "@/components/article/article-grid"

// access_token 가져오기
const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token") || null
  }
  return null
}

// 백엔드 API에서 상품 데이터를 가져오는 함수
const fetchArticles = async ({
  categories = [],
  sort = "newest",
  page = 0,
  size = 5,
  userId,
  priceRange = [0, 30000], // Add priceRange parameter
}: {
  categories?: number[]
  sort?: string
  page?: number
  size?: number
  userId?: number
  priceRange?: number[] // Add type definition
}) => {
  try {
    const accessToken = getAccessToken()

    // URL 쿼리 파라미터 구성
    const params = new URLSearchParams()

    if (categories.length > 0) {
      categories.forEach((cat) => params.append("category", cat.toString()))
    }

    // Add price range parameters
    
    params.append("sort", sort)
    params.append("page", page.toString())
    params.append("size", size.toString())
    params.append("minPrice", priceRange[0].toString())
    params.append("maxPrice", priceRange[1].toString())
    
    const queryString = params.toString()
    const url = `${process.env.NEXT_PUBLIC_API_URL}/secondhand-articles${queryString ? `?${queryString}` : ""}`

    console.log("Fetching articles from:", url)

    const headers: HeadersInit = { "Content-Type": "application/json" }
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}` // 로그인한 경우에만 헤더 추가
    }

    const res = await fetch(url, {
      method: "GET", 
      headers,
      cache: 'no-store' // Disable caching for development
    })

    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`)
      throw new Error("Failed to fetch articles")
    }

    const data = await res.json()
    console.log("API Response:", data)
    return data
  } catch (error) {
    console.error("Error fetching articles:", error)
    return { content: [], totalPages: 1, totalElements: 0 }
  }
}

export function RecentlyListed() {
  const [articles, setArticles] = useState<any[]>([])

  useEffect(() => {
    const loadLatestArticles = async () => {
      try {
        console.log("Loading latest articles...")
        // Use the fetchArticles function with specific parameters for recently listed
        const data = await fetchArticles({
          sort: "newest",
          page: 1,
          size: 5,
          priceRange: [0, 30000]
        })
        
        console.log("Articles data:", data)
        setArticles(data.content || [])
      } catch (error) {
        console.error("Error loading latest articles:", error)
        setArticles([])
      }
    }
    
    loadLatestArticles()
  }, [])

  return (
    <section className="py-12 bg-[#e05d55]/[0.04]">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">최근 등록된 상품</h2>
          <Link
            href="/articles"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            더 보기{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        <ArticleGrid 
          articles={articles.map(article => ({
            ...article,
            isLiked: article.liked,
        }))}
        />
      </div>
    </section>
  )
}