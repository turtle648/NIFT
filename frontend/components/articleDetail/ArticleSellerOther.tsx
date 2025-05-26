"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArticleService } from "@/lib/api/ArticleService";
import { Button } from "@/components/ui/button";
import { brandColors } from "@/lib/api/ArticleService";

type OtherArticle = {
  articleId: number;
  title: string;
  imageUrl: string;
  brandName: string;
  currentPrice: number;
  state: string;
};

export function ArticleSellerOther({ userId }: { userId: number }) {
  const [articles, setArticles] = useState<OtherArticle[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadArticles = async (pageToLoad: number, reset = false) => {
    try {
      const data = await ArticleService.getOtherArticlesByUser(userId, pageToLoad, 6);
      const newArticles = data.content || [];

      setArticles((prev) => reset ? newArticles : [...prev, ...newArticles]);
      setHasMore(!data.last);
    } catch (err) {
      console.error("❌ 판매자의 다른 상품 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    loadArticles(0, true); // 초기 로딩 시 리셋
  }, [userId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadArticles(nextPage);
  };

  const handleCollapse = () => {
    setPage(0);
    loadArticles(0, true);
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {articles.map((item) => (
          <Link
            key={item.articleId}
            href={`/article/${item.articleId}`}
            className="block"
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform hover:scale-105 duration-300"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                    style={{ backgroundColor: brandColors[item.brandName] || "#DD5851" }}
                  >
                    {item.brandName}
                  </span>
                </div>
              </div>
              <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-sm font-medium line-clamp-2 mb-auto">
                  {item.title}
                </h3>
                <div className="mt-2 text-sm font-bold text-primary text-right">
                🪙 {item.currentPrice.toLocaleString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center">
        {hasMore ? (
          <Button variant="outline" size="sm" onClick={handleLoadMore}>
            ▼ 더보기
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleCollapse}>
            ▲ 모두 접기
          </Button>
        )}
      </div>
    </div>
  );
}
