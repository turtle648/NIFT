"use client";

import Image from "next/image";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNFT } from "@/lib/api/web3";

export function GifticonCarousel({
  gifticons,
  selected,
  onSelect,
  scrollRef,
  onScroll,
}: {
  gifticons: UserNFT[];
  selected: BigInt | null;
  onSelect: (serialNum: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (dir: "left" | "right") => void;
}) {
  // Filter out redeemed gifticons before rendering
  const availableGifticons = gifticons.filter((gifticon) => !gifticon.redeemed);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">보유중인 기프티콘</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onScroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onScroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 overflow-y-visible"
      >
        {/* Map over the filtered list */}
        {availableGifticons.map((gifticon) => (
          <div
            key={Number(gifticon.serialNum)}
            className={`group relative z-10 cursor-pointer rounded-lg border 
              flex flex-col justify-between p-3 flex-shrink-0 transition-all
              w-[140px] h-[220px] sm:w-[180px] sm:h-[260px] md:w-[200px] md:h-[300px]
              ${
                selected === gifticon.serialNum
                  ? "border-primary bg-primary/5"
                  : ""
              }
              ${
                gifticon.isSelling || gifticon.isPending || gifticon.redeemed // Add redeemed check
                  ? "opacity-40 pointer-events-none" // Apply disabled style if selling, pending, OR redeemed
                  : "hover:border-gray-400 hover:shadow-md"
              }
            `}
            onClick={() => {
              // Prevent selection if selling, pending, OR redeemed
              if (gifticon.isSelling || gifticon.isPending || gifticon.redeemed)
                return;
              onSelect(String(gifticon.serialNum));
            }}
          >
            {/* 이미지 + 상태 */}
            <div className="relative h-[140px] sm:h-[180px] md:h-[200px]">
              <Image
                src={gifticon.image}
                alt={gifticon.title}
                fill
                sizes="(max-width: 768px) 40vw, 25vw"
                className="object-cover rounded-md transition-transform group-hover:scale-105"
                priority
                unoptimized
              />
              {/* Status Badges */}
              {(gifticon.isSelling ||
                gifticon.isPending ||
                gifticon.redeemed) && ( // Show badge if selling, pending, OR redeemed
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg z-10 ${
                      gifticon.redeemed ? "bg-gray-500" : "bg-red-500" // Different color for redeemed
                    }`}
                  >
                    {gifticon.redeemed
                      ? "사용 완료"
                      : gifticon.isSelling
                      ? "판매 등록 중"
                      : "선물 대기 중"}
                  </div>
                </div>
              )}
              {/* Selection Checkmark */}
              {selected === gifticon.serialNum &&
                !gifticon.redeemed &&
                !gifticon.isSelling &&
                !gifticon.isPending && ( // Only show checkmark if selectable and selected
                  <div className="absolute right-2 top-2 rounded-full bg-primary text-white h-6 w-6 flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                )}
            </div>

            {/* 텍스트 정보 */}
            <div className="mt-2">
              <h3 className="text-xs sm:text-sm font-medium truncate">
                {gifticon.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                유효기간: {gifticon.expiryDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
