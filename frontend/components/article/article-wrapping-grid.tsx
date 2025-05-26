"use client";

import {
  ArticleCard,
  ArticleCardProps,
} from "@/components/article/article-card";

// Define props based on what ArticleListing passes (using ArticleCardProps)
interface ArticleWrappingGridProps {
  articles: ArticleCardProps[]; // Use ArticleCardProps directly for simplicity
  className?: string;
  onUnlike?: (articleId: number) => void;
}

export function ArticleWrappingGrid({
  articles,
  className,
  onUnlike,
}: ArticleWrappingGridProps) {
  // Use Tailwind CSS grid for a responsive, wrapping grid layout
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}
    >
      {articles.map((article) => (
        // Render ArticleCard directly within the grid cell
        <ArticleCard
          key={article.articleId} // Key on the card
          {...article} // Spread all article props
          onUnlike={onUnlike} // Pass down the unlike handler
        />
      ))}
    </div>
  );
}
