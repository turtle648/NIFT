import { GifticonDetailCard } from "./SelectedGifticon";
import { RegisterForm } from "./RegisterForm";
import { GifticonCarousel } from "./GifticonCarousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";

export function RegisterPageLayout({
  gifticons,
  selected,
  onSelect,
  selectedData,
  onSubmit,
  carouselRef,
  onScroll,
}: any) {
  const isMobile = useIsMobile();

  return (
    <div className="container flex flex-col gap-8">
      {isMobile ? (
        // 모바일: 선택 → 캐러셀 → 작성
        <>
          <div>
            <h2 className="text-xl font-bold mb-2">선택한 기프티콘</h2>
            <GifticonDetailCard gifticon={selectedData} />
          </div>

          <div>
            <GifticonCarousel
              gifticons={gifticons}
              selected={selected}
              onSelect={onSelect}
              scrollRef={carouselRef}
              onScroll={onScroll}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">게시글 작성</h2>
            <RegisterForm onSubmit={onSubmit} />
          </div>
        </>
      ) : (
        // ✅ PC: 선택된 기프티콘 카드가 왼쪽, RegisterForm은 오른쪽
        <>
          <div className="grid grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-xl font-bold mb-4">선택한 기프티콘</h2>
              <GifticonDetailCard gifticon={selectedData} />
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">게시글 작성</h2>
              <RegisterForm onSubmit={onSubmit} />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="w-full">
            <GifticonCarousel
              gifticons={gifticons}
              selected={selected}
              onSelect={onSelect}
              scrollRef={carouselRef}
              onScroll={onScroll}
            />
          </div>
        </>
      )}
    </div>
  );
}
