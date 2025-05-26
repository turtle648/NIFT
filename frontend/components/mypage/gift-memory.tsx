"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Package, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { GiftMemoryCard } from "@/components/gift/gift-memory-card"
import { cn } from "@/lib/utils"
import { useGiftCardMobile } from "@/hooks/use-giftcard-mobile"
import type { GiftMemory } from "@/types/gift-memory"
import { GiftUnboxAnimation } from "@/components/gift/gift-animation/gift-unbox-animation"
import { getGift, getNFTDetailInfo, type UserNFT, sendReceiveNFT, confirmReceiveNFT } from "@/lib/api/web3"
import type { User } from "@/app/mypage/page"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { fetchReceivedGifts } from "@/lib/api/mypage"
import { Pagination } from "@/components/mypage/pagination"
import { apiClient } from "@/lib/api/CustomAxios"


// ----------------------------------------------------------------
// 1. 보낸 사람 정보를 API로 가져오는 함수
// BigInt를 문자열로 변환하고 끝에 'n'이 붙어있다면 제거합니다.
async function fetchGiftSender(serialNum: bigint) {
  const token = localStorage.getItem("access_token")
  try {
    const cleanSerial = serialNum.toString().replace(/n$/, "")
    const response = await apiClient.get(`/gift-histories/sender`, {
      params: { serialNum: cleanSerial },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    })
    console.log(`fetchGiftSender response for ${cleanSerial}:`, response.data)
    return response.data // 서버 응답이 "영민" 또는 { senderName: "영민", ... } 형태임.
  } catch (error) {
    console.error("선물 보낸 사람 정보 조회 실패:", error)
    return null
  }
}

interface GiftMemoriesProps {
  user: User
  availableGiftCards: any[]
  setAvailableGiftCards: React.Dispatch<React.SetStateAction<any[]>>
}

export function GiftMemories({ user, availableGiftCards, setAvailableGiftCards }: GiftMemoriesProps) {
  const [gifts, setGifts] = useState<UserNFT[]>([])
  const [memories, setMemories] = useState<GiftMemory[]>([])
  const [selectedGift, setSelectedGift] = useState<GiftMemory | null>(null)
  const [isUnboxing, setIsUnboxing] = useState(false)
  const isGiftCardMobile = useGiftCardMobile()
  const itemsPerPage = 8
  const [giftTab, setGiftTab] = useState("pending")
  const [pendingGifts, setPendingGifts] = useState<GiftMemory[]>([])
  const [acceptedMemories, setAcceptedMemories] = useState<GiftMemory[]>([])
  const [acceptedTotalPages, setAcceptedTotalPages] = useState(1)
  const [acceptedPage, setAcceptedPage] = useState(0)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [acceptedGiftCount, setAcceptedGiftCount] = useState<number | null>(null)
  const [transactionConfirmed, setTransactionConfirmed] = useState(false);

  // 상태 변경 로그로 현재 memories 값을 확인
  useEffect(() => {
    console.log("memories changed:", memories)
  }, [memories])

  // ----------------------------------------------------------------
  // 2. 컴포넌트 초기 데이터 로드: fetchGifts()는 마운트 시 1회 실행
  async function fetchGifts() {
    const result = await getGift(user.kakaoId)
    console.log("getGift result:", result)
    setGifts(result)
    const transformedGifts = transformApiDataToGiftMemories(result)
    setMemories(transformedGifts)
  }

  useEffect(() => {
    fetchGifts()
    fetchReceivedGifts(0, 1)
      .then((res) => {
        setAcceptedGiftCount(res.totalElements ?? 0)
      })
      .catch(() => {
        console.error("받은 선물 총 개수를 불러오는 데 실패했습니다.")
        setAcceptedGiftCount(0)
      })
  }, [user.kakaoId])

  useEffect(() => {
    if (giftTab === "accepted") {
      fetchReceivedGifts(acceptedPage, itemsPerPage)
        .then((res) => {
          const transformed = transformReceivedGiftResponse(res.content)
          setAcceptedMemories(transformed)
          setAcceptedTotalPages(res.totalPages)
          setAcceptedGiftCount(res.totalElements ?? 0)
        })
        .catch(() => {
          alert("받은 선물을 불러오는 데 실패했습니다.")
        })
    }
  }, [giftTab, acceptedPage])
  

  // ----------------------------------------------------------------
  // 3. 보낸 사람 정보를 업데이트하는 useEffect (캐싱 적용 및 단순 문자열도 처리)
  useEffect(() => {
    async function updateSenderInfo() {
      let needUpdate = false
      const senderCache: Record<string, string> = {}

      const updatedMemories = await Promise.all(
        memories.map(async (gift) => {
          // 이미 업데이트된 경우는 건너뜁니다.
          if (gift.senderNickname !== "선물 보낸 사람") return gift

          if (senderCache[gift.id]) {
            console.log(`캐시 사용: gift.id ${gift.id} -> ${senderCache[gift.id]}`)
            needUpdate = true
            return { ...gift, senderNickname: senderCache[gift.id] }
          }

          try {
            const senderInfo = await fetchGiftSender(BigInt(gift.id))
            console.log(`API 응답 for gift.id ${gift.id}:`, senderInfo)
            // 아래 로직 추가: 서버 응답이 문자열인 경우와 객체인 경우 모두 처리
            if (typeof senderInfo === "string" && senderInfo.trim().length > 0) {
              senderCache[gift.id] = senderInfo.trim()
              needUpdate = true
              return { ...gift, senderNickname: senderInfo.trim() }
            } else if (senderInfo && senderInfo.senderName) {
              senderCache[gift.id] = senderInfo.senderName
              needUpdate = true
              return { ...gift, senderNickname: senderInfo.senderName }
            }
          } catch (error) {
            console.error("보낸 사람 정보 업데이트 중 오류 발생:", error)
          }
          return gift
        })
      )
      if (needUpdate) {
        console.log("업데이트된 memories:", updatedMemories)
        setMemories(updatedMemories)
      }
    }
    if (memories.length > 0) {
      updateSenderInfo()
    }
  }, [memories])

  // ----------------------------------------------------------------
  // 4. pendingGifts와 acceptedMemories 상태 분리
  useEffect(() => {
    const pending = memories.filter((gift) => !gift.isAccepted)
    const accepted = memories.filter((gift) => gift.isAccepted)
    setPendingGifts(pending)
    setAcceptedMemories(accepted)
    console.log("pendingGifts 업데이트:", pending)
  }, [memories])

  // ----------------------------------------------------------------
  // 5. 선물 수락 처리
  const handleReceive = async (gift: UserNFT) => {
    console.log("선물 받기 프로세스 시작됨:", gift);
    // setIsUnboxing(true);
  
    // 1단계: 트랜잭션 전송 (메타마스크 컨펌)
    const tx = await sendReceiveNFT(gift.serialNum, user.kakaoId);
    if (!tx) {
      console.error("트랜잭션 전송 실패 - 선물 받기 실패");
      return;
    }
    console.log("메타마스크 컨펌 후 트랜잭션 전송 완료. tx hash:", tx.hash);
    
  
    // 트랜잭션 전송이 완료되었으므로 애니메이션 시작
    setIsUnboxing(true);
  
    // 2단계: 트랜잭션 확정 대기
    const receipt = await confirmReceiveNFT(tx);
    const txHash = tx.hash;
    if (receipt && receipt.status === 1) {
     
      setTransactionConfirmed(true);
      const data = {txHash}
      console.log("📦 transactionHash 확인:", data);
      await apiClient.post("/gift-histories/received", data);
      
      
    } else {
      console.error("선물 받기에 실패했습니다 - 트랜잭션 확정 실패");
      setIsUnboxing(false);
    }
  };
  

  // ----------------------------------------------------------------
  // 6. 받은 선물 API 응답 타입 및 변환 함수
  interface ReceivedGiftApiResponse {
    giftHistoryId: number
    senderNickname: string
    createdAt: string
    title?: string
    imageUrl?: string
    brandName?: string
    cardDesign: {
      id: string
      message: string
      recipientName: string
      frontTemplate: { id: string; background?: string }
      backTemplate: { id: string; background: string }
      frontElements: any[]
      backElements: any[]
      frontImage?: string
      backImage?: string
      flipped?: boolean
    }
    gifticonResponse?: {
      id: number
      name: string
      brandName: string
      imageUrl: string
    }
  }

  // 초기 받은 선물 개수 확인
  useEffect(() => {
    // 페이지 처음 로드 시 받은 선물 개수만 먼저 가져오기
    fetchReceivedGifts(0, 1) // 1개만 받아도 totalElements 정보는 포함됨
      .then((res) => {
        setAcceptedGiftCount(res.totalElements ?? 0)
      })
      .catch(() => {
        console.warn("초기 받은 선물 개수 로드 실패")
        setAcceptedGiftCount(0) // 실패 시 기본값이라도 설정
      })
  }, []) // ⬅ 초기 1회 실행
  

  function transformReceivedGiftResponse(apiData: ReceivedGiftApiResponse[]): GiftMemory[] {
    return apiData.map((item) => {
      const card = item.cardDesign
      return {
        id: String(item.giftHistoryId),
        senderName: "", // 사용하지 않음
        senderNickname: item.senderNickname,
        sentDate: item.createdAt,
        isAccepted: true,
        acceptedDate: item.createdAt,
        cardData: {
          id: card.id,
          frontTemplate: { background: card.frontTemplate.background || "transparent" },
          backTemplate: { background: card.backTemplate.background },
          frontElements: card.frontElements,
          backElements: card.backElements,
          frontImage: card.frontImage,
          backImage: card.backImage,
        },
        giftItem:
          item.title && item.imageUrl
            ? { id: String(item.giftHistoryId), title: item.title, brand: item.brandName ?? "", image: item.imageUrl }
            : undefined,
      }
    })
  }

  // ----------------------------------------------------------------
  // 7. transformApiDataToGiftMemories: 초기 선물 데이터를 GiftMemory로 변환
  function transformApiDataToGiftMemories(apiData: UserNFT[]): GiftMemory[] {
    const templates = [
      {
        frontTemplate: { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" },
        backTemplate: { background: "white" },
        frontElements: [
          { id: "text-1", type: "text", content: "FOR YOU", x: 150, y: 80, width: 100, height: 40, rotation: 0, zIndex: 2, fontFamily: "'Noto Sans KR', sans-serif" },
          { id: "text-2", type: "text", content: "NIFT gift", x: 130, y: 130, width: 140, height: 30, rotation: 0, zIndex: 2, fontFamily: "'Gaegu', cursive" },
        ],
        backElements: [
          { id: "recipient-element", type: "text", content: "To. 친구", x: 50, y: 50, width: 300, height: 50, rotation: 0, zIndex: 1, fontFamily: "'Noto Serif KR', serif" },
          { id: "message-element", type: "text", content: "선물을 받아주셔서 감사합니다!", x: 50, y: 120, width: 300, height: 150, rotation: 0, zIndex: 1, fontFamily: "'Gaegu', cursive" },
        ],
      },
      {
        frontTemplate: { background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)" },
        backTemplate: { background: "white" },
        frontElements: [
          { id: "text-1", type: "text", content: "선물이 도착했어요!", x: 120, y: 100, width: 160, height: 40, rotation: 0, zIndex: 2, fontFamily: "'Jua', sans-serif" },
        ],
        backElements: [
          { id: "recipient-element", type: "text", content: "To. 친구", x: 50, y: 50, width: 300, height: 50, rotation: 0, zIndex: 1, fontFamily: "'Noto Serif KR', serif" },
          { id: "message-element", type: "text", content: "특별한 날을 축하합니다!", x: 50, y: 120, width: 300, height: 150, rotation: 0, zIndex: 1, fontFamily: "'Gaegu', cursive" },
        ],
      },
    ]

    return apiData.map((item, index) => {
      const isAccepted = !item.isPending
      const sentDate = new Date(Number(item.pendingDate) * 1000).toISOString()
      const acceptedDate = isAccepted ? new Date().toISOString() : undefined
      const cardTemplate = templates[index % templates.length]
      const frontElements = [...cardTemplate.frontElements]
      if (item.title) {
        frontElements.push({
          id: "title-element",
          type: "text",
          content: item.title,
          x: 150,
          y: 180,
          width: 200,
          height: 40,
          rotation: 0,
          zIndex: 2,
          fontFamily: "'Noto Sans KR', sans-serif",
        })
      }
      return {
        id: String(item.serialNum),
        senderName: "선물 보낸 사람", // 초기 placeholder
        senderNickname: "선물 보낸 사람", // 초기 placeholder
        sentDate,
        isAccepted,
        acceptedDate,
        cardData: { ...cardTemplate, frontElements },
        giftItem: {
          id: String(item.id),
          title: item.title,
          brand: item.brand,
          price: item.price || 0,
          image: item.image,
        },
      }
    })
  }

  // ----------------------------------------------------------------
  // 8. 선물 수락 애니메이션 관련 처리
  const handleAcceptGift = (giftId: string) => {
    setIsUnboxing(true)
    if (selectedGift && selectedGift.id === giftId) {
      console.log(`선물 ${giftId} 수락 처리`)
    }
  }

  const handleUnboxComplete = () => {
    if (selectedGift && transactionConfirmed) {
      const now = new Date().toISOString();
      const updatedMemories = memories.map((gift) =>
        gift.id === selectedGift.id
          ? { ...gift, isAccepted: true, acceptedDate: now }
          : gift
      );
      setMemories(updatedMemories);
      setSelectedGift({ ...selectedGift, isAccepted: true, acceptedDate: now });
      setIsUnboxing(false);
      // 완료 후 플래그 초기화
      setTransactionConfirmed(false);

      window.location.href = '/mypage';
    }
  };


  // ----------------------------------------------------------------
  // 9. UI 렌더링
  return (
    <Tabs value={giftTab} onValueChange={setGiftTab} className="space-y-8">
      <TabsList className="w-full">
        <TabsTrigger value="pending" className="flex-1">
          받을 수 있는 선물 ({pendingGifts.length})
        </TabsTrigger>
        <TabsTrigger value="accepted" className="flex-1">
          받은 선물 ({acceptedGiftCount})
        </TabsTrigger>
      </TabsList>

      {/* Pending Gifts */}
      <TabsContent value="pending">
        {pendingGifts.length > 0 ? (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {pendingGifts.map((gift) => {
              console.log("렌더링 pending gift:", gift.id, gift.senderNickname)
              return (
                <Dialog key={gift.id}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer" onClick={() => setSelectedGift(gift)}>
                      <div className={cn("relative overflow-hidden", isGiftCardMobile ? "aspect-[4/3]" : "h-[200px]")}>
                        <GiftMemoryCard cardData={gift.cardData} isAccepted={gift.isAccepted} showFlipHint={false} />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <Button variant="secondary" className="font-medium">선물 받기</Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-sm font-medium">
                          from. {gift.senderNickname}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(gift.sentDate), "yyyy.MM.dd a hh:mm", { locale: ko })}
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md p-6" aria-describedby="dialog-description">
                    {selectedGift && selectedGift.id === gift.id && (
                      <div className="space-y-4">
                        <DialogTitle>새로운 선물이 도착했습니다!</DialogTitle>
                        {isUnboxing ? (
                          <GiftUnboxAnimation gift={selectedGift} onComplete={handleUnboxComplete} />
                        ) : (
                          <div className="text-center py-8">
                            <div className="flex justify-center">
                              <Image src="/gift-box.png" alt="Gift box" width={200} height={200} className="mx-auto" />
                            </div>
                            <div id="dialog-description">
                              <p className="mt-4 mb-4">
                                <span className="font-bold">{gift.senderNickname}</span> 님이 보낸 선물이 도착했습니다.
                                <br />선물을 수락하면 카드와 기프티콘을 확인할 수 있습니다.
                              </p>
                            </div>
                            <Button onClick={() => {
                              const apiGift = gifts.find((g) => String(g.serialNum) === gift.id)
                              if (apiGift) handleReceive(apiGift)
                            }}>
                              선물 수락하기
                            </Button>
                            <div className="p-4">
                              <div className="text-sm font-medium">
                                from. {gift.senderNickname}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(gift.sentDate), "yyyy.MM.dd a hh:mm", { locale: ko })}
                              </div>
                            </div>
                          </div>
                          
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>받을 수 있는 선물이 없습니다.</p>
          </div>
        )}
      </TabsContent>

      {/* Accepted Gifts */}
      <TabsContent value="accepted">
        {acceptedMemories.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {acceptedMemories.map((gift) => (
                <Dialog key={gift.id} onOpenChange={(open) => { if (!open) setIsCardFlipped(false) }}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer" onClick={() => { setSelectedGift(gift); setIsCardFlipped(false) }}>
                      <div className={cn("relative overflow-hidden bg-gray-100 rounded-lg", isGiftCardMobile ? "aspect-[4/3]" : "h-[250px]")}>
                        {gift.cardData?.frontImage ? (
                          <Image src={gift.cardData.frontImage} alt={`${gift.senderNickname}님의 선물 앞면`} fill className="object-cover object-center" priority unoptimized />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <Package size={48} />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="text-sm font-medium">
                          from. {gift.senderNickname}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(gift.sentDate), "yyyy.MM.dd a hh:mm", { locale: ko })}
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="p-6" style={{ perspective: "1500px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", borderRadius: "1rem" }}>
                    {selectedGift && selectedGift.id === gift.id && (
                      <>
                        <div className="w-full max-w-[400px] aspect-[4/3]" style={{ perspective: "1000px" }}>
                          <div className={cn("relative w-full h-full transition-transform duration-700", "[transform-style:preserve-3d]")} style={{ transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                            <div className="absolute w-full h-full [backface-visibility:hidden] rounded-xl overflow-hidden shadow-md border border-gray-200">
                              {selectedGift.cardData?.frontImage ? (
                                <Image src={selectedGift.cardData.frontImage} alt={`${selectedGift.senderNickname}님의 선물 앞면`} fill className="object-contain" unoptimized />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-gray-100">
                                  <Package size={48} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-hidden shadow-md border border-gray-200">
                              {selectedGift.cardData?.backImage ? (
                                <Image src={selectedGift.cardData.backImage} alt={`${selectedGift.senderNickname}님의 선물 뒷면`} fill className="object-contain" unoptimized />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-gray-100">
                                  <Package size={48} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>
                          {(selectedGift.cardData?.frontImage || selectedGift.cardData?.backImage) && (
                            <Button size="icon" className="absolute bottom-4 right-4 z-10 rounded-full backdrop-blur-md bg-white/70 hover:bg-white border border-gray-300 shadow-md transition" onClick={() => setIsCardFlipped(!isCardFlipped)}>
                              <RefreshCcw className="w-5 h-5 text-gray-700" />
                            </Button>
                          )}
                        </div>
                        <div className="w-full max-w-[400px] bg-white shadow-lg p-5 rounded-xl space-y-6 border border-gray-100">
                          <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900">🎁 선물 정보</h3>
                            {selectedGift.giftItem ? (
                              <div className="flex gap-4 items-center">
                                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                                  <Image src={selectedGift.giftItem.image || "/placeholder.svg"} alt={selectedGift.giftItem.title || "기프티콘 이미지"} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-base font-semibold text-gray-900">{selectedGift.giftItem.title}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">기프티콘 정보를 불러올 수 없습니다.</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">보낸 사람:</span> {selectedGift.senderNickname}</p>
                            <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">보낸 날짜:</span> {format(new Date(selectedGift.sentDate), "yyyy.MM.dd a hh:mm", { locale: ko })}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              ))}
            </div>
            <Pagination currentPage={acceptedPage} totalPage={acceptedTotalPages} setCurrentPage={setAcceptedPage} />
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>아직 받은 선물이 없습니다.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
    
  )
}
