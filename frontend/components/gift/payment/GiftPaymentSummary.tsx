"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import GiftPaymentButton from "./GiftPaymentButton";

interface Friend {
  uuid: string;
  kakaoId: number;
  profile_nickname: string;
  profile_thumbnail_image: string;
}

interface GiftPaymentSummaryProps {
  article: any;
  agreedTerms: boolean;
  setAgreedTerms: (val: boolean) => void;
  onSubmit: () => void;
  isLoading: boolean;
  cardId: string;
  selectedFriend: Friend | null;
  type: string;
}

export function GiftPaymentSummary({
  article,
  agreedTerms,
  setAgreedTerms,
  onSubmit,
  isLoading,
  cardId,
  selectedFriend,
  type,
}: GiftPaymentSummaryProps) {

  const isGifticon = type === "gifticon";
  const isArticle = type === "article";

  console.log("아티클 정보: ", article, " - ", article.price)

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">결제 정보</h2>
        <div className="space-y-4">
          {isArticle && (
            <>
              <div className="flex justify-between py-2">
              <span className="text-gray-600">상품 금액</span>
              <span className="font-medium">
                🪙{article.originalPrice}
              </span>
              </div>
              {article.originalPrice > article.price && (
                <div className="flex justify-between py-2 text-primary">
                  <span>할인 금액</span>
                  <span>
                    - 🪙{(article.originalPrice - article.price)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-600">선물 포장</span>
                <span className="font-medium">무료</span>
              </div>
              <Separator />
              <div className="flex justify-between py-2">
                <span className="font-medium">최종 결제 금액</span>
                <span className="text-lg font-bold text-primary">
                  🪙{article.price}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              id="terms-agree"
              className="rounded border-gray-300"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              required
            />
            <Label htmlFor="terms-agree">
              주문 내용 확인 및 결제 진행에 동의합니다
            </Label>
          </div>

          <GiftPaymentButton
            article={article}
            isLoading={isLoading}
            disabled={!agreedTerms}
            onClick={() => {
              onSubmit();
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
