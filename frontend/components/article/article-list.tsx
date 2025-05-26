"use client";

import { ArticleListItem, ArticleListItemProps } from "./article-list-item";

interface ArticleListProps {
  articles: Omit<ArticleListItemProps, "onUnlike" | "className">[]; // Base props needed
  className?: string;
  onUnlike?: (articleId: number) => void; // Optional unlike handler
}

export function ArticleList({
  articles,
  className,
  onUnlike,
}: ArticleListProps) {
  return (
    <div className={className}>
      {articles.map((article) => (
        <ArticleListItem
          key={article.articleId}
          {...article}
          onUnlike={onUnlike} // Pass down the unlike handler
        />
      ))}
    </div>
  );
}
