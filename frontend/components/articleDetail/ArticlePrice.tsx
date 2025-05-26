// components/article/ArticlePrice.tsx

type ArticlePriceProps = {
  currentPrice: number;
  originalPrice: number; 
};

export function ArticlePrice({
  currentPrice,
  originalPrice,
}: ArticlePriceProps) {
  const isDiscounted = originalPrice > currentPrice;
  const discountPercent = isDiscounted
    ? Math.round((1 - currentPrice / originalPrice) * 100)
    : 0;
    console.log("currentPrice", currentPrice)
    console.log("originalPrice",originalPrice)

  return (
    <div className="mb-6 flex items-baseline gap-2">
      <span className="text-3xl font-bold">
      🪙{currentPrice.toLocaleString()}
      </span>

      {isDiscounted && (
        <>
          <span className="text-sm line-through text-muted-foreground">
          🪙{originalPrice.toLocaleString()}
          </span>
          <span className="text-sm text-primary">  {discountPercent}% 할인</span>
        </>
      )}
    </div>
  );
}
