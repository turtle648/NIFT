"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArticleService } from "@/lib/api/ArticleService";
import { useState } from "react";
import { ArticlePriceCard } from "./article-card-price";

export interface ArticleCardProps {
  articleId: number;
  title: string;
  brandName: string;
  currentPrice: number;
  originalPrice: number;
  discountRate: number;
  imageUrl: string;
  isLiked?: boolean;
  className?: string;
  state?: string;
  likeCount?: number; // Add like count prop
  onUnlike?: (articleId: number) => void;
}

export function ArticleCard({
  articleId,
  title,
  brandName,
  currentPrice,
  originalPrice,
  imageUrl,
  isLiked: initialIsLiked,
  className,
  state,
  likeCount, // Destructure like count
  onUnlike,
}: ArticleCardProps) {
  const isSold = state === "SOLD";
  const [isLiked, setIsLiked] = useState(initialIsLiked ?? false);
  const imageSrc = imageUrl || "/placeholder.svg?height=400&width=400";

  // 실제 텍스트 자르기
  const getShortTitle = (title: string, maxLength: number) => {
    return title.length > maxLength
      ? title.slice(0, maxLength - 3) + "..."
      : title;
  };

  const handleLikeToggle = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);

    const success = await ArticleService.toggleLike(articleId, isLiked);
    if (!success) {
      setIsLiked((prev) => !prev);
    } else if (!nextLiked && onUnlike) {
      onUnlike(articleId);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-lg border bg-white transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1", // Enhanced hover effect
        isSold && "opacity-60",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-30 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm"
        aria-label={isLiked ? "찜 해제하기" : "찜하기"}
        onClick={handleLikeToggle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "h-4 w-4",
            isLiked ? "fill-red-500 text-red-500" : "text-gray-500"
          )}
          fill={isLiked ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </Button>

      <Link
        href={`/article/${articleId}`}
        className="block flex flex-col h-full"
      >
        <div className="relative w-full aspect-[1/1] overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          {isSold && (
            <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <span className="text-white text-lg font-bold">판매 완료</span>
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col justify-between flex-grow">
          <div>
            <div className="mb-1 text-xs text-gray-500 truncate max-w-full">
              {brandName}
            </div>
            <h3 className="text-sm font-medium truncate max-w-full">
              {title.length > 10 ? title.slice(0, 10) + "..." : title}
            </h3>
            {/* Like Count */}
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              {likeCount !== undefined && (
                <span className="flex items-center gap-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 fill-red-500 text-red-500" // Use red color for likes
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {likeCount}
                </span>
              )}
            </div>
          </div>
          <div className="mt-2">
            <ArticlePriceCard
              currentPrice={currentPrice}
              originalPrice={originalPrice}
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
