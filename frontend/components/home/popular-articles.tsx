"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArticleGrid } from "@/components/article/article-grid"
import { Article5AService } from "@/lib/api/ArticleService"


export function PopularArticles() {
  const [articles, setArticles] = useState<any[]>([])


  useEffect(() => {
    const loadTop5 = async () => {
      const data = await Article5AService();
      setArticles(data.content || []);
    };
    loadTop5();
  }, []);

  return (
    <section className="py-12">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">인기 상품</h2>
          <Link href="/articles?sort=likes&page=1" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
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