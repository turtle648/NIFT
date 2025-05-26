"use client";

import { ArticleCard } from "@/components/article/article-card";

// Assuming the original DTO interface was like this
interface ArticleListDto {
  articleId: number;
  categoryId: number;
  categoryName: string;
  brandName: string;
  title: string;
  description: string;
  priceInfo: {
    currentPrice: number;
    originalPrice: number;
  };
  discountRate: number;
  imageUrl: string;
  countLikes: number;
  viewCnt: number;
  createdAt: string;
  isLiked: boolean;
  state?: string; // Added state based on ArticleCardProps
}

interface ArticleGridProps {
  articles: ArticleListDto[];
  className?: string;
  onUnlike?: (articleId: number) => void; // Added based on ArticleCardProps
}

// Reverting to the original Carousel implementation
export function ArticleGrid({
  articles,
  className,
  onUnlike,
}: ArticleGridProps) {
  return (
    <div
      className={`flex overflow-x-auto gap-4 px-2 scroll-smooth items-stretch ${className}`}
    >
      {articles.map((article) => (
        <div
          key={article.articleId}
          // Original responsive widths for carousel items
          className="min-w-[45%] sm:min-w-[40%] md:min-w-[33.33%] lg:min-w-[250px] max-w-[300px] shrink-0 flex flex-col h-full"
        >
          <ArticleCard
            articleId={article.articleId}
            title={article.title}
            brandName={article.brandName}
            currentPrice={article.priceInfo.currentPrice}
            originalPrice={article.priceInfo.originalPrice}
            discountRate={article.discountRate}
            imageUrl={article.imageUrl}
            isLiked={article.isLiked}
            state={article.state}
            onUnlike={onUnlike} // Pass down onUnlike
          />
        </div>
      ))}
    </div>
  );
}
