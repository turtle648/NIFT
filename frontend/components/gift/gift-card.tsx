"use client";

import { useNft, UserNFT } from "@/lib/api/web3";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface GiftCardProps {
  expiryDays: string;
  card: UserNFT;
  // onGifticonUsed?: (serialNum: number) => void;
}

interface UsedGifticon {
  usedHistoryId: number;
  brandName: string;
  title: string;
  usedAt: string;
  imageUrl: string;
}

export function GiftCard({ expiryDays, card }: GiftCardProps) {
  const router = useRouter();

  const handleCardClick = useCallback(() => {
    router.push(`/mypage/nift/${card.serialNum}`);
  }, [card.serialNum, router]);

  return (
    <div
      onClick={handleCardClick}
      className="group block relative overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md cursor-pointer" // Added cursor-pointer
    >
      {/* Removed redundant outer div, Link acts as the container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={card.image || "/placeholder.svg"}
          alt={card.title} // Ensure alt text is present
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {expiryDays && (
          <div className="absolute left-2 top-2 rounded bg-gray-700 px-2 py-1 text-xs text-white">
            {expiryDays}
          </div>
        )}
        {card.redeemed && (
          <>
            <div className="absolute inset-0 bg-black/30"></div>
            <div
              className="absolute left-2 top-2 rounded px-2 py-1 text-xs text-white font-medium"
              style={{ backgroundColor: "#dd5851" }}
            >
              사용 완료
            </div>
          </>
        )}
        {card.isPending && (
          <>
            <div className="absolute inset-0 bg-black/30"></div>
            <div
              className="absolute left-2 top-2 rounded px-2 py-1 text-xs text-white font-medium"
              style={{ backgroundColor: "#dd5851" }}
            >
              선물 대기 중
            </div>
          </>
        )}
        {card.isSelling && (
          <>
            <div className="absolute inset-0 bg-black/30"></div>
            <div
              className="absolute left-2 top-2 rounded px-2 py-1 text-xs text-white font-medium"
              style={{ backgroundColor: "#dd5851" }}
            >
              판매 대기 중
            </div>
          </>
        )}
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-500">{card.brand}</div>
        <h3 className="line-clamp-2 text-sm font-medium">{card.title}</h3>
        {card.redeemedAt !== 0n && (
          <div className="mt-2 text-xs text-gray-500">
            <div>
              사용일:
              {new Date(Number(card.redeemedAt) * 1000).toLocaleString()}
            </div>
          </div>
        )}
      </div>
      {/* Removed buttons and QR scanner logic */}
    </div>
  );
}

interface UsedGiftCardProps {
  gifticon: UsedGifticon;
}

export function UsedGiftCard({ gifticon }: UsedGiftCardProps) {
  return (
    <div className="group block relative overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md cursor-default">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={gifticon.imageUrl || "/placeholder.svg"}
          alt={gifticon.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div
          className="absolute left-2 top-2 rounded px-2 py-1 text-xs text-white font-medium"
          style={{ backgroundColor: "#dd5851" }}
        >
          사용 완료
        </div>
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-500">{gifticon.brandName}</div>
        <h3 className="line-clamp-2 text-sm font-medium">{gifticon.title}</h3>
        <div className="mt-2 text-xs text-gray-500">
          사용일: {new Date(gifticon.usedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}