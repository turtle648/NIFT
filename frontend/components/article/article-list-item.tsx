"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArticleService } from "@/lib/api/ArticleService";
import { useState } from "react";
import { ArticlePriceCard } from "./article-card-price"; // Reuse price component

// Re-use the props from ArticleCard for consistency
export interface ArticleListItemProps {
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

export function ArticleListItem({
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
}: ArticleListItemProps) {
  const isSold = state === "SOLD";
  const [isLiked, setIsLiked] = useState(initialIsLiked ?? false);
  const imageSrc = imageUrl || "/placeholder.svg?height=100&width=100"; // Smaller placeholder for list

  const handleLikeToggle = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault(); // Prevent link navigation when clicking like
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);

    const success = await ArticleService.toggleLike(articleId, isLiked);
    if (!success) {
      setIsLiked((prev) => !prev); // Revert if API call fails
    } else if (!nextLiked && onUnlike) {
      onUnlike(articleId); // Notify parent if unliked
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 p-3 border rounded-md mb-2 bg-white transition-all hover:bg-gray-50", // Added border, rounded, margin-bottom; removed border-b
        isSold && "opacity-60",
        className
      )}
    >
      {/* Image Section */}
      <Link href={`/article/${articleId}`} className="flex-shrink-0 block">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-md border">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="100px" // Specify size for optimization
          />
          {isSold && (
            <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-md">
              <span className="text-white text-xs font-bold">판매 완료</span>
            </div>
          )}
        </div>
      </Link>

      {/* Details Section */}
      <div className="flex-1 min-w-0 flex justify-between items-start gap-2">
        <Link href={`/article/${articleId}`} className="flex-1 min-w-0">
          <div className="mb-0.5 text-xs text-gray-500 truncate">
            {brandName}
          </div>
          <h3 className="text-sm font-medium truncate mb-1">{title}</h3>
          <ArticlePriceCard
            currentPrice={currentPrice}
            originalPrice={originalPrice}
            // size="sm" // Removed size prop as it's not supported
          />
          {/* Like and Comment Counts */}
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
        </Link>

        {/* Like Button */}
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-8 w-8 rounded-full self-start mt-1" // Align top right
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
      </div>
    </div>
  );
}
