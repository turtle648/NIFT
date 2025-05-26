// "use client"

// import type React from "react"

// import { useEffect, useState, useMemo } from "react"
// import Image from "next/image"
// import { format } from "date-fns"
// import { ko } from "date-fns/locale"
// import { Package } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
// import { GiftMemoryCard } from "@/components/gift/gift-memory-card"
// import { cn } from "@/lib/utils"
// import { useGiftCardMobile } from "@/hooks/use-giftcard-mobile"
// import type { GiftMemory } from "@/types/gift-memory"
// // 상단에 GiftUnboxAnimation 컴포넌트 import 추가
// import { GiftUnboxAnimation } from "@/components/gift/gift-animation/gift-unbox-animation"
// import { getGift, getNFTDetailInfo, receiveNFT, type UserNFT } from "@/lib/api/web3"
// import type { User } from "@/app/mypage/page"
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
// import { fetchReceivedGifts } from "@/lib/api/mypage"
// import { RefreshCcw } from "lucide-react"
// import { Pagination } from "@/components/mypage/pagination"


// interface GiftMemoriesProps {
//   user: User
//   availableGiftCards: any[]
//   setAvailableGiftCards: React.Dispatch<React.SetStateAction<any[]>>
// }

// export function GiftMemories({ user, availableGiftCards, setAvailableGiftCards }: GiftMemoriesProps) {
//   const [gifts, setGifts] = useState<UserNFT[]>([])
//   const [memories, setMemories] = useState<GiftMemory[]>([])
//   const [selectedGift, setSelectedGift] = useState<GiftMemory | null>(null)
//   const [isUnboxing, setIsUnboxing] = useState(false)
//   const isGiftCardMobile = useGiftCardMobile()
//   const itemsPerPage = 8 // 페이지당 아이템 수 감소
//   const [giftTab, setGiftTab] = useState("pending")
//   const [pendingGifts, setPendingGifts] = useState<GiftMemory[]>([])
//   const [acceptedMemories, setAcceptedMemories] = useState<GiftMemory[]>([])
//   const [acceptedTotalPages, setAcceptedTotalPages] = useState(1)
//   const [acceptedPage, setAcceptedPage] = useState(0)
//   const [isCardFlipped, setIsCardFlipped] = useState(false) // 카드 뒤집기 상태 추가
//   const [acceptedGiftCount, setAcceptedGiftCount] = useState<number | null>(null); // 받은 선물 총 개수 상태 추가
  

//   async function fetchGifts() {
//     const result = await getGift(user.kakaoId)
//     setGifts(result)

//     // Transform API data to match the GiftMemory format
//     const transformedGifts = transformApiDataToGiftMemories(result)
//     setMemories(transformedGifts)
//   }

//   useEffect(() => {
//     fetchGifts();
//     // 컴포넌트 마운트 시 받은 선물 총 개수 가져오기
//     fetchReceivedGifts(0, 1) // 첫 페이지만 가져와서 totalElements 확인
//       .then((res) => {
//         // API 응답에 totalElements가 있다고 가정합니다. 없다면 API 수정 필요
//         setAcceptedGiftCount(res.totalElements ?? 0);
//       })
//       .catch(() => {
//         console.error("받은 선물 총 개수를 불러오는 데 실패했습니다.");
//         setAcceptedGiftCount(0); // 실패 시 0으로 설정
//       });
//   }, [user.kakaoId]); // user.kakaoId 의존성 유지

//   // handleAcceptGift 함수를 다음과 같이 수정
//   const handleAcceptGift = (giftId: string) => {
//     // 언박싱 애니메이션 시작
//     setIsUnboxing(true)

//     // 선택된 선물이 있고 그 선물의 ID가 수락한 선물의 ID와 같다면 선택된 선물도 업데이트
//     if (selectedGift && selectedGift.id === giftId) {
//       // 애니메이션이 끝나면 상태 업데이트
//       // 실제 구현에서는 여기서 API 호출을 통해 선물 수락 처리
//       console.log(선물 ${giftId} 수락 처리)
//     }
//   }

//   // 애니메이션 완료 후 처리 함수 추가
//   const handleUnboxComplete = () => {
//     if (selectedGift) {
//       const now = new Date().toISOString()

//       // 메모리 상태 업데이트
//       const updatedMemories = memories.map((gift) =>
//         gift.id === selectedGift.id ? { ...gift, isAccepted: true, acceptedDate: now } : gift,
//       )

//       setMemories(updatedMemories)

//       // 선택된 선물 상태 업데이트
//       setSelectedGift({ ...selectedGift, isAccepted: true, acceptedDate: now })

//       // 언박싱 상태 초기화
//       setIsUnboxing(false)
//     }
//   }

//   const formatDate = (dateString: string) => {
//     // 유효하지 않은 날짜 문자열 처리
//     try {
//       return format(new Date(dateString), "yyyy.MM.dd a hh:mm", { locale: ko })
//     } catch (error) {
//       console.error("Invalid date format:", dateString, error);
//       return "날짜 정보 없음";
//     }
//   }
//   // Add this function to transform API data to GiftMemory format
//   const transformApiDataToGiftMemories = (apiData: UserNFT[]): GiftMemory[] => {
//     // 카드 템플릿 정의 (Pending 탭 용 임시 데이터)
//     const templates = [
//       {
//         frontTemplate: {
//           background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
//         },
//         backTemplate: {
//           background: "white",
//         },
//         frontElements: [
//           {
//             id: "text-1",
//             type: "text",
//             content: "FOR YOU",
//             x: 150,
//             y: 80,
//             width: 100,
//             height: 40,
//             rotation: 0,
//             zIndex: 2,
//             fontFamily: "'Noto Sans KR', sans-serif",
//           },
//           {
//             id: "text-2",
//             type: "text",
//             content: "NIFT gift",
//             x: 130,
//             y: 130,
//             width: 140,
//             height: 30,
//             rotation: 0,
//             zIndex: 2,
//             fontFamily: "'Gaegu', cursive",
//           },
//         ],
//         backElements: [
//           {
//             id: "recipient-element",
//             type: "text",
//             content: "To. 친구",
//             x: 50,
//             y: 50,
//             width: 300,
//             height: 50,
//             rotation: 0,
//             zIndex: 1,
//             fontFamily: "'Noto Serif KR', serif",
//           },
//           {
//             id: "message-element",
//             type: "text",
//             content: "선물을 받아주셔서 감사합니다!",
//             x: 50,
//             y: 120,
//             width: 300,
//             height: 150,
//             rotation: 0,
//             zIndex: 1,
//             fontFamily: "'Gaegu', cursive",
//           },
//         ],
//       },
//       {
//         frontTemplate: {
//           background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
//         },
//         backTemplate: {
//           background: "white",
//         },
//         frontElements: [
//           {
//             id: "text-1",
//             type: "text",
//             content: "선물이 도착했어요!",
//             x: 120,
//             y: 100,
//             width: 160,
//             height: 40,
//             rotation: 0,
//             zIndex: 2,
//             fontFamily: "'Jua', sans-serif",
//           },
//         ],
//         backElements: [
//           {
//             id: "recipient-element",
//             type: "text",
//             content: "To. 친구",
//             x: 50,
//             y: 50,
//             width: 300,
//             height: 50,
//             rotation: 0,
//             zIndex: 1,
//             fontFamily: "'Noto Serif KR', serif",
//           },
//           {
//             id: "message-element",
//             type: "text",
//             content: "특별한 날을 축하합니다!",
//             x: 50,
//             y: 120,
//             width: 300,
//             height: 150,
//             rotation: 0,
//             zIndex: 1,
//             fontFamily: "'Gaegu', cursive",
//           },
//         ],
//       },
//     ]

//     return apiData.map((item, index) => {
//       const isAccepted = !item.isPending
//       const sentDate = new Date(Number(item.pendingDate) * 1000).toISOString()
//       const acceptedDate = isAccepted
//         ? new Date(Date.now() - Math.random() * 86400000).toISOString()
//         : undefined
//       const cardTemplate = templates[index % templates.length]
//       const frontElements = [...cardTemplate.frontElements]
//       if (item.title) {
//         frontElements.push({
//           id: "title-element",
//           type: "text",
//           content: item.title,
//           x: 150,
//           y: 180,
//           width: 200,
//           height: 40,
//           rotation: 0,
//           zIndex: 2,
//           fontFamily: "'Noto Sans KR', sans-serif",
//         })
//       }

//       return {
//         id: String(item.serialNum),
//         senderName: "선물 보낸 사람", // Placeholder
//         senderNickname: item.brand, // Use brand as sender nickname
//         sentDate,
//         isAccepted,
//         acceptedDate,
//         cardData: {
//           ...cardTemplate,
//           frontElements,
//         },
//         giftItem: {
//           id: String(item.id),
//           title: item.title,
//           brand: item.brand,
//           price: item.price || 0,
//           image: item.image,
//         },
//       }
//     })
//   }

//   // Create separate arrays for accepted and pending gifts
//   useEffect(() => {
//     setPendingGifts(memories.filter((gift) => !gift.isAccepted))
//     setAcceptedMemories(memories.filter((gift) => gift.isAccepted))
//   }, [memories])

//   const handleReceive = async (gift: UserNFT) => {
//     const response = await receiveNFT(gift.serialNum, user.kakaoId)
//     if (response.success) {

//       // setIsUnboxing(true);

//       setGifts(gifts.filter((g) => g.serialNum !== gift.serialNum))
//       const newInfo = await getNFTDetailInfo(gift.serialNum)
//       const updatedUsedGiftCards = [...availableGiftCards, newInfo]
//       setAvailableGiftCards(updatedUsedGiftCards)
//       setMemories((prevMemories) =>
//         prevMemories.map((mem) =>
//           mem.id === String(gift.serialNum)
//             ? {
//                 ...mem,
//                 isAccepted: true,
//                 acceptedDate: new Date().toISOString(),
//               }
//             : mem,
//         ),
//       )
//       alert("선물 받기가 완료 되었습니다")
//       // 선물 받기 성공 후 받은 선물 탭으로 이동하고 새로고침
//       setGiftTab("accepted");
//       fetchReceivedGifts(0, itemsPerPage) // 첫 페이지 로드
//         .then((res) => {
//           const transformed = transformReceivedGiftResponse(res.content)
//           setAcceptedMemories(transformed)
//           setAcceptedTotalPages(res.totalPages)
//           setAcceptedPage(0); // 페이지 초기화
//           // 선물 받기 성공 시 총 개수 업데이트 (API 응답 기반)
//           setAcceptedGiftCount(res.totalElements ?? 0); // setAcceptedGiftCount 사용 확인
//         })
//         .catch(() => {
//         alert("받은 선물을 불러오는 데 실패했습니다.")
//       })
//     } else {
//       alert("선물 받기에 실패했습니다.")
//     }
//   }

//   // API 응답 타입 정의 
//   interface ReceivedGiftApiResponse {
//     giftHistoryId: number;
//     senderNickname: string;
//     createdAt: string;
//     title?: string;
//     imageUrl?: string;
//     brandName?: string;
//     cardDesign: {
//       id: string;
//       message: string;
//       recipientName: string;
//       frontTemplate: { id: string; background?: string };
//       backTemplate: { id: string; background: string };
//       frontElements: any[];
//       backElements: any[];
//       frontImage?: string; // base64
//       backImage?: string; // base64
//       flipped?: boolean; 
//     };
//     gifticonResponse?: {
//         id: number;
//         name: string;
//         brandName: string;
//         imageUrl: string;
//     }
//   }

//   function transformReceivedGiftResponse(apiData: ReceivedGiftApiResponse[]): GiftMemory[] {
//     return apiData.map((item) => {
//       const card = item.cardDesign
  
//       return {
//         id: String(item.giftHistoryId),
//         senderName: "",
//         senderNickname: item.senderNickname,
//         sentDate: item.createdAt,
//         isAccepted: true,
//         acceptedDate: item.createdAt,
//         cardData: {
//           frontTemplate: {
//             background: card.frontTemplate.background || 'transparent',
//           },
//           backTemplate: {
//             background: card.backTemplate.background,
//           },
//           frontElements: card.frontElements,
//           backElements: card.backElements,
//           frontImage: card.frontImage,
//           backImage: card.backImage,
//         },
//         // title과 imageUrl이 모두 존재할 때만 giftItem 생성, Optional 필드 안전하게 처리
//         giftItem: (item.title && item.imageUrl) ? {
//           id: String(item.giftHistoryId), // 기프티콘 ID가 별도로 없으므로 giftHistoryId 사용
//           title: item.title,
//           brand: item.brandName ?? "", // brandName이 null/undefined면 빈 문자열
//           image: item.imageUrl,        // imageUrl은 존재가 보장됨
//         } : undefined, // title 또는 imageUrl 없으면 undefined
//       }
//     })
//   }
  


//   useEffect(() => {
//     // Accepted 탭이 활성화될 때만 데이터를 가져옴
//     if (giftTab === 'accepted') {
//       fetchReceivedGifts(acceptedPage, itemsPerPage)
//         .then((res) => {
//           const transformed = transformReceivedGiftResponse(res.content)
//           setAcceptedMemories(transformed)
//           setAcceptedTotalPages(res.totalPages)
//           // 탭 변경 시에도 totalElements 업데이트 (선물 수락 등으로 변경되었을 수 있으므로)
//           setAcceptedGiftCount(res.totalElements ?? 0); // setAcceptedGiftCount 사용 확인
//         })
//         .catch(() => {
//         alert("받은 선물을 불러오는 데 실패했습니다.")
//       })
//     }
//   }, [giftTab, acceptedPage, itemsPerPage]) // itemsPerPage도 의존성 배열에 추가

//   return (
//     <Tabs value={giftTab} onValueChange={setGiftTab} className="space-y-8">
//       <TabsList className="w-full">
//         <TabsTrigger value="pending" className="flex-1">
//           받을 수 있는 선물 ({pendingGifts.length})
//         </TabsTrigger>
//         <TabsTrigger value="accepted" className="flex-1">
//           받은 선물 ({acceptedMemories.length})
//         </TabsTrigger>
//       </TabsList>

//       {/* Pending Gifts */}
//       <TabsContent value="pending">
//         {pendingGifts.length > 0 ? (
//           <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
//             {pendingGifts.map((gift) => (
//               <Dialog key={gift.id}>
//                 <DialogTrigger asChild>
//                   <div className="cursor-pointer" onClick={() => setSelectedGift(gift)}>
//                     <div className={cn("relative overflow-hidden", isGiftCardMobile ? "aspect-[4/3]" : "h-[200px]")}>
//                       {/* Pending 탭에서는 GiftMemoryCard 사용 유지 */}
//                       <GiftMemoryCard cardData={gift.cardData} isAccepted={gift.isAccepted} showFlipHint={false} />
//                       <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
//                         <Button variant="secondary" className="font-medium">선물 받기</Button>
//                       </div>
//                     </div>
//                     <div className="p-4 flex justify-between items-center">
//                       <div className="text-sm font-medium">from. {gift.senderNickname}</div>
//                       <div className="text-xs text-gray-500">{formatDate(gift.sentDate)}</div>
//                     </div>
//                   </div>
//                 </DialogTrigger>
//                 <DialogContent className="sm:max-w-md p-6" aria-describedby="dialog-description">
                  
//                     {/* <DialogTitle>선물 수락</DialogTitle> */}
//                   {/* selectedGift와 현재 매핑 중인 gift의 ID가 일치할 때만 내용을 렌더링 */}
//                   {selectedGift && selectedGift.id === gift.id && (
//                     <div className="space-y-4">
//                       <DialogTitle>새로운 선물이 도착했습니다!</DialogTitle>
//                       {isUnboxing ? (
//                         <GiftUnboxAnimation gift={selectedGift} onComplete={handleUnboxComplete} />
//                       ) : (
//                         <div className="text-center py-8">
//                           <div className="flex justify-center">
//                             <Image src="/gift-box.png" alt="Gift box" width={200} height={200} className="mx-auto"/>
//                           </div>
//                           <div id="dialog-description">
//                             <p  className="mt-4 mb-4">
//                               <span className="font-bold">{gift.senderNickname}</span>님이 보낸 선물이 도착했습니다.
//                               <br />선물을 수락하면 카드와 기프티콘을 확인할 수 있습니다.
//                             </p>
//                           </div>
//                           <Button onClick={() => {
//                             const apiGift = gifts.find((g) => String(g.serialNum) === gift.id)
//                             if (apiGift) handleReceive(apiGift)
//                             // else setIsUnboxing(true) // 언박싱 애니메이션은 수락 시에만
//                           }}>
//                             선물 수락하기
//                           </Button>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </DialogContent>
//               </Dialog>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12 text-gray-500">
//             <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
//             <p>받을 수 있는 선물이 없습니다.</p>
//           </div>
//         )}
//       </TabsContent>

//       {/* Accepted Gifts */}
//       <TabsContent value="accepted">
//         {acceptedMemories.length > 0 ? (
//           <>
//             <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
//               {acceptedMemories.map((gift) => (
//                 <Dialog key={gift.id} onOpenChange={(open) => { if (!open) setIsCardFlipped(false); }}>
//                   <DialogTrigger asChild>
//                     <div className="cursor-pointer" onClick={() => {
//                         setSelectedGift(gift);
//                         setIsCardFlipped(false); // Dialog 열 때 카드 앞면으로 초기화
//                       }}>
//                         {/* 이미지 중앙 표시 및 둥근 모서리 추가 */}
//                         <div className={cn("relative overflow-hidden bg-gray-100 rounded-lg", isGiftCardMobile ? "aspect-[4/3]" : "h-[250px]")}> {/* rounded-lg 추가 */}
//                         {gift.cardData?.frontImage ? (
//                           <Image
//                             src={gift.cardData.frontImage} // Base64 데이터 직접 사용
//                             alt={${gift.senderNickname}님의 선물 앞면}
//                             fill
//                             className="object-cover object-center" // 중앙 부분을 확대하여 표시
//                             priority // LCP 개선을 위해 추가 가능
//                             unoptimized // Base64 이미지 최적화 비활성화
//                           />
//                         ) : (
//                           // 이미지가 없을 경우 fallback
//                           <div className="flex items-center justify-center h-full text-gray-400">
//                             <Package size={48} />
//                           </div>
//                         )}
//                       </div>
//                       <div className="p-4 flex justify-between items-center">
//                         <div className="text-sm font-medium">from. {gift.senderNickname}</div>
//                         <div className="text-xs text-gray-500">{formatDate(gift.sentDate)}</div>
//                       </div>
//                     </div>
//                   </DialogTrigger>
//                   <DialogContent
//                     className="p-6"
//                     style={{
//                       perspective: "1500px",
//                       width: "100%",
//                       maxWidth: "520px",
//                       maxHeight: "90vh",
//                       overflowY: "auto",
//                       display: "flex",
//                       flexDirection: "column",
//                       alignItems: "center",
//                       gap: "1.5rem",
//                       borderRadius: "1rem",
//                     }}
//                   >
//                     {selectedGift && selectedGift.id === gift.id && (
//                       <>
//                         {/* 카드 플립 컨테이너 */}
//                         <div className="w-full max-w-[400px] aspect-[4/3]" style={{ perspective: "1000px" }}>
//                           <div
//                             className={cn(
//                               "relative w-full h-full transition-transform duration-700",
//                               "[transform-style:preserve-3d]",
//                             )}
//                             style={{ transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
//                           >
//                             {/* 앞면 */}
//                             <div className="absolute w-full h-full [backface-visibility:hidden] rounded-xl overflow-hidden shadow-md border border-gray-200">
//                               {selectedGift.cardData?.frontImage ? (
//                                 <Image
//                                   src={selectedGift.cardData.frontImage}
//                                   alt={${selectedGift.senderNickname}님의 선물 앞면}
//                                   fill
//                                   className="object-contain"
//                                   unoptimized
//                                 />
//                               ) : (
//                                 <div className="flex items-center justify-center h-full bg-gray-100">
//                                   <Package size={48} className="text-gray-400" />
//                                 </div>
//                               )}
//                             </div>

//                             {/* 뒷면 */}
//                             <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-hidden shadow-md border border-gray-200">
//                               {selectedGift.cardData?.backImage ? (
//                                 <Image
//                                   src={selectedGift.cardData.backImage}
//                                   alt={${selectedGift.senderNickname}님의 선물 뒷면}
//                                   fill
//                                   className="object-contain"
//                                   unoptimized
//                                 />
//                               ) : (
//                                 <div className="flex items-center justify-center h-full bg-gray-100">
//                                   <Package size={48} className="text-gray-400" />
//                                 </div>
//                               )}
//                             </div>
//                           </div>

//                           {/* 카드 플립 버튼 */}
//                           {(selectedGift.cardData?.frontImage || selectedGift.cardData?.backImage) && (
//                             <Button
//                               size="icon"
//                               className="absolute bottom-4 right-4 z-10 rounded-full backdrop-blur-md bg-white/70 hover:bg-white border border-gray-300 shadow-md transition"
//                               onClick={() => setIsCardFlipped(!isCardFlipped)}
//                             >
//                               <RefreshCcw className="w-5 h-5 text-gray-700" />
//                             </Button>
//                           )}
//                         </div>

//                         {/* 선물 + 상세 정보 카드 */}
//                         <div className="w-full max-w-[400px] bg-white shadow-lg p-5 rounded-xl space-y-6 border border-gray-100">
//                           <div className="space-y-4">
//                             <h3 className="text-lg font-bold text-gray-900">🎁 선물 정보</h3>
//                             {selectedGift.giftItem ? (
//                               <div className="flex gap-4 items-center">
//                                 <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
//                                   <Image
//                                     src={selectedGift.giftItem.image || "/placeholder.svg"}
//                                     alt={selectedGift.giftItem.title || "기프티콘 이미지"}
//                                     fill
//                                     className="object-cover"
//                                   />
//                                 </div>
//                                 <div className="flex-1">
//                                   <p className="text-base font-semibold text-gray-900">
//                                     {selectedGift.giftItem.title}
//                                   </p>
//                                 </div>
//                               </div>
//                             ) : (
//                               <p className="text-sm text-gray-500">기프티콘 정보를 불러올 수 없습니다.</p>
//                             )}
//                           </div>

//                           <div className="space-y-2">
//                             <p className="text-sm text-gray-700">
//                               <span className="font-medium text-gray-900">보낸 사람:</span> {selectedGift.senderNickname}
//                             </p>
//                             <p className="text-sm text-gray-700">
//                               <span className="font-medium text-gray-900">보낸 날짜:</span> {formatDate(selectedGift.sentDate)}
//                             </p>
//                           </div>
//                         </div>
//                       </>
//                     )}
//                   </DialogContent>

//                 </Dialog>
//               ))}
//             </div>
//               <Pagination
//               currentPage={acceptedPage}
//               totalPage={acceptedTotalPages}
//               setCurrentPage={setAcceptedPage}
//               />
//           </>
//         ) : (
//           <div className="text-center py-12 text-gray-500">
//             <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
//             <p>아직 받은 선물이 없습니다.</p>
//           </div>
//         )}
//       </TabsContent>
//     </Tabs>
//   )
// }