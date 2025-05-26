"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Repeat } from "lucide-react"
import type { CardElement } from "@/types/gift-card"
import Image from "next/image"

interface CardPreviewProps {
  cardData: any
  className?: string
}

export function CardPreview({ cardData, className }: CardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  // 카드 뒤집기 핸들러
  const handleFlipCard = () => {
    setIsFlipping(true)

    // 애니메이션 완료 후 상태 변경
    setTimeout(() => {
      setIsFlipped((prev) => !prev)
      setIsFlipping(false)
    }, 400)
  }

  // 컴포넌트 마운트 시 카드 크기에 맞게 스케일 계산
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && cardData) {
        // 기본 카드 크기 (편집 화면에서의 크기)
        const originalWidth = 400 // 기준 카드 너비를 400px로 설정

        // 미리보기 컨테이너 크기에 맞게 스케일 조정
        const containerWidth = containerRef.current.clientWidth
        const newScale = containerWidth / originalWidth
        setScale(newScale)
      }
    }

    updateScale()

    // 윈도우 리사이즈 이벤트에 대한 리스너 추가
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [cardData])

  // 카드 데이터가 없는 경우 처리
  if (!cardData) {
    return (
      <div className={cn("w-full aspect-[4/3] rounded-lg bg-gray-100", className)}>
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500">카드 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    )
  }

  // 앞면, 뒷면에 대한 데이터
  const frontTemplate = cardData.frontTemplate
  const backTemplate = cardData.backTemplate
  const frontElements = cardData.frontElements || []
  const backElements = cardData.backElements || []

  // 현재 표시할 템플릿과 요소들
  const currentTemplate = isFlipped ? backTemplate : frontTemplate
  const currentElements = isFlipped ? backElements : frontElements

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="perspective-1000 w-full">
        <div
          className={cn(
            "relative w-full aspect-[4/3] rounded-lg shadow-md overflow-visible",
            isFlipping ? "animate-flip" : "",
            isFlipped ? "rotate-y-180" : "",
          )}
        >
          {/* 카드 앞면 */}
          <div
            className="absolute inset-0 backface-hidden overflow-hidden"
            style={{
              background: frontTemplate.background,
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              visibility: isFlipped ? "hidden" : "visible",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* 배경이 이미지 데이터인 경우 이미지로 표시 */}
            {frontTemplate.background && frontTemplate.background.startsWith("data:image/") && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={frontTemplate.background}
                  alt="Background"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.error("배경 이미지 로딩 오류")
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
              </div>
            )}

            {/* 앞면 요소들을 표시 - 스케일 적용 */}
            {frontElements.map((element: CardElement) => (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: `${element.x * scale}px`,
                  top: `${element.y * scale}px`,
                  width: `${element.width * scale}px`,
                  height: `${element.height * scale}px`,
                  transform: `rotate(${element.rotation}deg)`,
                  zIndex: element.zIndex || 1,
                  transformOrigin: "center center",
                  willChange: "transform", // 성능 최적화
                }}
              >
                {element.type === "text" && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span
                      style={{
                        fontFamily: element.fontFamily || "inherit",
                        fontSize: `${Math.min(element.width / 10, element.height / 2) * scale}px`,
                        maxWidth: "100%",
                        wordBreak: "break-word",
                      }}
                    >
                      {element.content}
                    </span>
                  </div>
                )}

                {element.type === "image" && element.src && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={element.src || "/placeholder.svg"}
                      alt="User uploaded"
                      fill
                      className="object-contain"
                      onError={(e) => {
                        console.error("이미지 로딩 오류:", element.id)
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=100&width=100&text=이미지+오류"
                      }}
                    />
                  </div>
                )}

                {element.type === "sticker" && element.src && (
                  <div className="w-full h-full flex items-center justify-center">
                    {element.src.includes("text=") ? (
                      <div
                        className="text-center w-full h-full flex items-center justify-center"
                        style={{
                          fontSize: `${Math.min(element.width, element.height) * 0.6 * scale}px`,
                        }}
                      >
                        {element.src.split("text=")[1].replace(/%20/g, " ")}
                      </div>
                    ) : (
                      <Image
                        src={element.src || "/placeholder.svg"}
                        alt="Sticker"
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 카드 뒷면 */}
          <div
            className="absolute inset-0 backface-hidden overflow-hidden"
            style={{
              background: backTemplate.background,
              transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
              visibility: isFlipped ? "visible" : "hidden",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* 뒷면 요소들을 감싸는 컨테이너 추가 - 반전 효과 상쇄 */}
            <div className="relative w-full h-full overflow-visible" style={{ transform: "rotateY(180deg)" }}>
              {backElements.map((element: CardElement) => (
                <div
                  key={element.id}
                  className="absolute"
                  style={{
                    left: `${element.x * scale}px`,
                    top: `${element.y * scale}px`,
                    width: `${element.width * scale}px`,
                    height: `${element.height * scale}px`,
                    transform: `rotate(${element.rotation}deg)`,
                    zIndex: element.zIndex || 1,
                    transformOrigin: "center center",
                  }}
                >
                  {element.type === "text" && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span
                        style={{
                          fontFamily: element.fontFamily || "inherit",
                          fontSize: `${Math.min(element.width / 10, element.height / 2) * scale}px`,
                          maxWidth: "100%",
                          wordBreak: "break-word",
                        }}
                      >
                        {element.content}
                      </span>
                    </div>
                  )}

                  {element.type === "image" && element.src && (
                    <div className="w-full h-full flex items-center justify-center">
                      {element.src.startsWith("data:image/") ? (
                        <Image
                          src={element.src || "/placeholder.svg"}
                          alt="User uploaded"
                          fill
                          className="object-contain"
                          onError={(e) => {
                            console.error("이미지 로딩 오류:", element.id)
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=100&width=100&text=이미지+오류"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded">
                          <p className="text-sm text-gray-500">이미지를 불러올 수 없습니다</p>
                        </div>
                      )}
                    </div>
                  )}

                  {element.type === "sticker" && element.src && (
                    <div className="w-full h-full flex items-center justify-center">
                      {element.src.includes("text=") ? (
                        <div
                          className="text-center w-full h-full flex items-center justify-center"
                          style={{
                            fontSize: `${Math.min(element.width, element.height) * 0.6 * scale}px`,
                          }}
                        >
                          {element.src.split("text=")[1].replace(/%20/g, " ")}
                        </div>
                      ) : (
                        <Image
                          src={element.src || "/placeholder.svg"}
                          alt="Sticker"
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 카드 뒤집기 버튼 */}
      <Button
        variant="secondary"
        size="sm"
        className="absolute bottom-3 right-3 z-10"
        onClick={handleFlipCard}
        disabled={isFlipping}
      >
        <Repeat className="h-4 w-4 mr-1" />
        {isFlipped ? "앞면 보기" : "뒷면 보기"}
      </Button>

      {/* 카드 뒤집기 애니메이션을 위한 CSS */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        @keyframes flip {
          0% {
            transform: ${isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"};
          }
          100% {
            transform: ${isFlipped ? "rotateY(0deg)" : "rotateY(180deg)"};
          }
        }
        
        .animate-flip {
          animation: flip 0.8s;
        }
      `}</style>
    </div>
  )
}

