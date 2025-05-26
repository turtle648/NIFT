import { UserNFT } from "@/lib/api/web3";
import Image from "next/image";

export function GifticonDetailCard({ gifticon }: { gifticon: UserNFT }) {
  if (!gifticon)
    return (
      <div
        className="bg-gray-100 border border-gray-300 p-6 rounded-lg flex items-center justify-center text-muted-foreground text-center
      w-full max-w-xs sm:max-w-sm md:max-w-md h-64 sm:h-72 md:h-96"
      >
        기프티콘을 선택하세요
      </div>
    );

  return (
    <div className="flex flex-col items-center p-4">
      {/* ✅ 이미지 영역 */}
      <div className="relative w-[250px] h-[250px] mb-4">
        <Image
          src={gifticon.image}
          alt="선택된 기프티콘"
          fill
          className="object-contain rounded-md"
        />
      </div>

      {/* ✅ 정보 카드 */}
      <div className="bg-white rounded-lg p-5 max-w-md w-full text-sm shadow-sm">
        <h3 className="text-lg font-semibold text-center mb-3">
          {gifticon.title}
        </h3>
        <div className="space-y-1.5">
          <InfoRow label="브랜드" value={gifticon.brand} />
          <InfoRow label="카테고리" value={gifticon.category} />
          <InfoRow label="소비자 가격" value={`${gifticon.price} 🪙`} />
          <InfoRow label="유효기간" value={gifticon.expiryDate} />
          <InfoRow label="시리얼 번호" value={String(gifticon.serialNum)} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-700 text-[14px] leading-tight">
      <span className="font-medium">{label}</span>
      <span>{value}</span>
    </div>
  );
}
