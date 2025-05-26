"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import QrScanner from "@/components/ui/QrScanner";
import { useLoading } from "@/components/LoadingContext";
import { getNFTDetailInfo, useNft, UserNFT } from "@/lib/api/web3";
import { markGifticonUsedAsRedeemed } from "@/lib/api/mypage"; // Import the new function
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const calculateDday = (dateString: string): number => {
  const expiryDate = new Date(dateString);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : -1;
};

export default function NiftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const serialNum = params.serialNum as string;

  const [niftDetails, setNiftDetails] = useState<UserNFT | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const { isLoading, setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serialNum) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const details = await getNFTDetailInfo(BigInt(serialNum));
          if (details) {
            setNiftDetails(details);
          } else {
            setError("Nift 정보를 찾을 수 없습니다.");
          }
        } catch (err) {
          console.error("Nift 조회 실패:", err);
          setError("Nift 정보를 불러오는데 실패했습니다.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [serialNum, setIsLoading]);

  const handleGift = useCallback(() => {
    if (!niftDetails) return;
    router.push(`/gift/${niftDetails.serialNum}/customize?type=gifticon`);
  }, [niftDetails, router]);

  const handleUseNft = useCallback(
    async (walletAddress: string) => {
      if (!niftDetails) return;
      setIsLoading(true);
      try {
        const response = await useNft(
          Number(niftDetails.serialNum),
          walletAddress
        );
        if (response.success && response.txHash) {
          // Call the backend API to mark as used
          const markUsedResponse = await markGifticonUsedAsRedeemed(
            response.txHash
          );
          if (markUsedResponse.success) {
            console.log("Successfully marked gifticon as used in backend DB.");
            alert("사용이 완료되었습니다.");
            const updated = await getNFTDetailInfo(BigInt(serialNum));
            setNiftDetails(updated);
          } else {
            console.error(
              "Failed to mark gifticon as used in backend DB:",
              markUsedResponse.error
            );
            alert(
              "사용 처리 중 일부 과정에 오류가 발생했습니다. 관리자에게 문의하세요."
            );
          }
        } else {
          alert("사용에 실패했습니다.");
        }
      } catch (err) {
        console.error("Nift 사용 실패:", err);
        alert("사용 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [niftDetails, setIsLoading, serialNum]
  );

  const onScanSuccessHandler = useCallback(
    (walletAddress: string) => {
      console.log("✅ 인식된 지갑 주소:", walletAddress);
      setIsQrScannerOpen(false);
      handleUseNft(walletAddress);
    },
    [handleUseNft]
  );

  const expiryDays = niftDetails ? calculateDday(niftDetails.expiryDate) : null;
  const isActionable =
    niftDetails &&
    !niftDetails.redeemed &&
    !niftDetails.isPending &&
    !niftDetails.isSelling;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto max-w-md px-4 pt-4 pb-16">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-2 flex items-center gap-1 text-sm text-gray-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          뒤로가기
        </Button>

        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading Nift details...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : niftDetails ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="relative w-full aspect-square">
              <Image
                src={niftDetails.image || "/placeholder.svg"}
                alt={niftDetails.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute left-2 top-2 flex flex-col gap-1">
                {expiryDays !== null &&
                  expiryDays >= 0 &&
                  !niftDetails.redeemed && (
                    <span className="rounded bg-gray-700 px-2 py-1 text-xs text-white">
                      D-{expiryDays}
                    </span>
                  )}
                {niftDetails.redeemed && (
                  <span className="rounded bg-red-500 px-2 py-1 text-xs text-white font-medium">
                    사용 완료
                  </span>
                )}
                {niftDetails.isPending && (
                  <span className="rounded bg-orange-500 px-2 py-1 text-xs text-white font-medium">
                    선물 대기 중
                  </span>
                )}
                {niftDetails.isSelling && (
                  <span className="rounded bg-blue-500 px-2 py-1 text-xs text-white font-medium">
                    판매 대기 중
                  </span>
                )}
              </div>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-500 mb-1">{niftDetails.brand}</p>
              <h1 className="text-xl font-semibold mb-3">
                {niftDetails.title}
              </h1>

              <div className="text-sm space-y-1 text-gray-700">
                <p>
                  <strong>시리얼 번호:</strong>{" "}
                  {niftDetails.serialNum.toString()}
                </p>
                <p>
                  <strong>유효 기간:</strong>{" "}
                  {new Date(niftDetails.expiryDate).toLocaleDateString()}
                </p>
                {niftDetails.redeemed && niftDetails.redeemedAt !== 0n && (
                  <p>
                    <strong>사용일:</strong>{" "}
                    {new Date(
                      Number(niftDetails.redeemedAt) * 1000
                    ).toLocaleString()}
                  </p>
                )}
              </div>

              {isActionable && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => setIsQrScannerOpen(true)}
                    className="w-full"
                    size="lg"
                  >
                    사용하기 (QR 스캔)
                  </Button>
                  <Button
                    onClick={handleGift}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    선물하기
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {isQrScannerOpen && (
          <QrScanner
            onClose={() => setIsQrScannerOpen(false)}
            onScanSuccess={onScanSuccessHandler}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
