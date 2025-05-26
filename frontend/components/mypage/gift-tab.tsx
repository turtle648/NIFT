import { GiftCard } from "@/components/gift/gift-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserNFT } from "@/lib/api/web3";
import { Pagination } from "./pagination";
import { UsedGiftCard } from "@/components/gift/gift-card";

interface GiftTabProps {
  userRole: number;
  availableGiftCards: any[];
  usedGiftCards: any[];
  calculatedCards: any[];
  ITEMS_PER_PAGE: number;
  availableCurrentPage: number;
  setAvailableCurrentPage: (page: number) => void;
  usedCurrentPage: number;
  setUsedCurrentPage: (page: number) => void;
  calculatedCurrentPage: number;
  setCalculatedCurrentPage: (page: number) => void;
  calculateDday: (expiry: string) => number;
  giftCardTab: string;
  setGiftCardTab: (tab: string) => void;
  onGifticonCalculated: (serialNum: number) => void;
  usedTotalPage: number;
  usedTotalCount: number;
}

interface UsedGifticon {
  usedHistoryId: number;
  brandName: string;
  title: string;
  usedAt: string;
  imageUrl: string;
}

export function GiftTab({
  userRole,
  availableGiftCards,
  usedGiftCards,
  calculatedCards,
  ITEMS_PER_PAGE,
  availableCurrentPage,
  setAvailableCurrentPage,
  usedCurrentPage,
  setUsedCurrentPage,
  calculatedCurrentPage,
  setCalculatedCurrentPage,
  calculateDday,
  giftCardTab,
  setGiftCardTab,
  onGifticonCalculated,
  usedTotalPage,
  usedTotalCount
}: GiftTabProps) {
  const availableTotalPage =
    Math.ceil(availableGiftCards.length / ITEMS_PER_PAGE) || 1;
  const calculatedTotalPage = Math.ceil(calculatedCards.length / ITEMS_PER_PAGE) || 1;
  
  return (
    <Tabs value={giftCardTab} onValueChange={setGiftCardTab}>
      <TabsList className="w-full">
        <TabsTrigger value="available" className="flex-1">
          사용 가능 {availableGiftCards.length}
        </TabsTrigger>
        <TabsTrigger value="used" className="flex-1">
          사용 완료 {usedTotalCount}
        </TabsTrigger>
        {userRole === 1 && (
          <TabsTrigger value="calculated" className="flex-1">
          정산 완료 {calculatedCards.length}
        </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="available" className="mt-6">
        {(() => {
          const sortedAvailableGiftCards = [
            ...availableGiftCards
                .filter(card => !card.isPending && !card.isSelling)
                .sort((a, b) => Number(b.id) - Number(a.id)),
            ...availableGiftCards
                .filter(card => !card.isPending && card.isSelling)
                .sort((a, b) => Number(b.id) - Number(a.id)),
            ...availableGiftCards
                .filter(card => card.isPending && !card.isSelling)
                .sort((a, b) => Number(b.id) - Number(a.id)),
          ];

          return (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                  {sortedAvailableGiftCards
                      .slice(
                          availableCurrentPage * ITEMS_PER_PAGE,
                          (availableCurrentPage + 1) * ITEMS_PER_PAGE
                      )
                      .map((card: UserNFT) => (
                          <GiftCard
                              key={Number(card.serialNum)}
                              expiryDays={`D-${calculateDday(card.expiryDate)}`}
                              card={card}
                          />
                      ))}
                </div>

                {availableGiftCards.length === 0 ? (
                    <div className="mt-8 mb-12 text-center text-muted-foreground">
                      사용 가능한 기프티콘이 없습니다.
                    </div>
                ) : (
                    <Pagination
                        currentPage={availableCurrentPage}
                        totalPage={availableTotalPage}
                        setCurrentPage={setAvailableCurrentPage}
                    />
                )}
              </>
          );
        })()}
      </TabsContent>

      <TabsContent value="used" className="mt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {usedGiftCards.map((gifticon) => (
              <UsedGiftCard key={gifticon.usedHistoryId} gifticon={gifticon} />
          ))}
        </div>

        {usedGiftCards.length === 0 ? (
          <div className="mt-8 mb-12 text-center text-muted-foreground">
            사용 완료된 기프티콘이 없습니다.
          </div>
        ) : (
          <Pagination
            currentPage={usedCurrentPage}
            totalPage={usedTotalPage}
            setCurrentPage={setUsedCurrentPage}
          />
        )}
      </TabsContent>

      {userRole === 1 && (

        <TabsContent value="calculated" className="mt-6">
        {/* Changed grid-cols-1 to grid-cols-2 for better mobile layout */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {calculatedCards
            .slice(
              calculatedCurrentPage * ITEMS_PER_PAGE,
              (calculatedCurrentPage + 1) * ITEMS_PER_PAGE
            )
            .map((card: UserNFT) => (
              <GiftCard
              key={Number(card.serialNum)}
              expiryDays={`D-${calculateDday(card.expiryDate)}`}
              card={card}
              />
            ))}
        </div>

        {calculatedCards.length === 0 ? (
          <div className="mt-8 mb-12 text-center text-muted-foreground">
            정산 완료된 기프티콘이 없습니다.
          </div>
        ) : (
          <Pagination
          currentPage={calculatedCurrentPage}
          totalPage={calculatedTotalPage}
          setCurrentPage={setCalculatedCurrentPage}
          />
        )}
      </TabsContent>
      )}
    </Tabs>
  );
}