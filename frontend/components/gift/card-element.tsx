"use client"

import type React from "react"

import { useRef, useState, useCallback, memo } from "react"
import { useDraggable } from "@/hooks/use-draggable"
import { useResizable } from "@/hooks/use-resizable"
import type { CardElement as CardElementType } from "@/types/gift-card"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CardElementProps {
  element: CardElementType
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updatedElement: CardElementType) => void
  onDelete: () => void
  isCardFlipped?: boolean
  scale?: number
}

export const CardElement = memo(function CardElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  isCardFlipped = false,
  scale = 1,
}: CardElementProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRotating, setIsRotating] = useState(false)

  const { position, handleMouseDown, handleTouchStart } = useDraggable({
    initialPosition: { x: element.x, y: element.y },
    onDragEnd: (position) => {
      onUpdate({ ...element, x: position.x, y: position.y })
    },
    isCardFlipped: isCardFlipped,
    scale: scale,
    containerRef: containerRef, // 컨테이너 참조 전달
  })

  const { size, handleResizeStart } = useResizable({
    initialSize: { width: element.width, height: element.height },
    onResizeEnd: (size) => {
      onUpdate({ ...element, width: size.width, height: size.height })
    },
    scale: scale,
    containerRef: containerRef, // 컨테이너 참조 전달
    elementRef: containerRef, // 요소 참조 전달
  })

  // 회전 관련 상태 및 함수
  const [rotation, setRotation] = useState(element.rotation)

  const handleRotateStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation()
      setIsRotating(true)

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

      const startAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)

      const handleRotateMove = (moveEvent: MouseEvent | TouchEvent) => {
        const moveClientX = "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX
        const moveClientY = "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY

        const angle = Math.atan2(moveClientY - centerY, moveClientX - centerX) * (180 / Math.PI)
        const newRotation = element.rotation + (angle - startAngle)

        setRotation(newRotation)
        onUpdate({ ...element, rotation: newRotation })
      }

      const handleRotateEnd = () => {
        setIsRotating(false)
        document.removeEventListener("mousemove", handleRotateMove)
        document.removeEventListener("touchmove", handleRotateMove)
        document.removeEventListener("mouseup", handleRotateEnd)
        document.removeEventListener("touchend", handleRotateEnd)
      }

      document.addEventListener("mousemove", handleRotateMove)
      document.addEventListener("touchmove", handleRotateMove)
      document.addEventListener("mouseup", handleRotateEnd)
      document.addEventListener("touchend", handleRotateEnd)
    },
    [element, onUpdate],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        onDelete()
      }
    },
    [onDelete],
  )

  return (
    <div
      ref={containerRef}
      className={cn("absolute cursor-move", isSelected && "z-10")}
      style={{
        left: `${position.x * scale}px`,
        top: `${position.y * scale}px`,
        width: `${size.width * scale}px`,
        height: `${size.height * scale}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
        zIndex: element.zIndex,
        pointerEvents: "auto",
      }}
      onClick={(e) => {
        // 편집 UI 내부 요소 클릭 시 이벤트 전파 중지
        if (
          (e.target as HTMLElement).tagName === "INPUT" ||
          (e.target as HTMLElement).tagName === "TEXTAREA" ||
          (e.target as HTMLElement).tagName === "BUTTON" ||
          (e.target as HTMLElement).closest(".border.rounded-md.p-3.mt-4")
        ) {
          e.stopPropagation()
          return
        }

        e.stopPropagation()
        e.preventDefault()
        onSelect()
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {element.type === "image" && element.src && (
        <div className="w-full h-full relative">
          <Image
            src={element.src || "/placeholder.svg"}
            alt="User uploaded"
            fill
            className="object-contain"
            draggable={false}
            crossOrigin="anonymous"
            loading="lazy"
            decoding="async"
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
                fontSize: `${Math.min(size.width, size.height) * 0.6 * scale}px`,
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
              draggable={false}
              crossOrigin="anonymous"
            />
          )}
        </div>
      )}

      {element.type === "text" && (
        <div
          className="w-full h-full flex items-center justify-center text-center overflow-hidden"
          style={{ cursor: isSelected ? "text" : "move" }}
        >
          <span
            style={{
              fontSize: `${Math.min(size.width / 10, size.height / 2) * scale}px`,
              maxWidth: "100%",
              wordBreak: "break-word",
              fontFamily: element.fontFamily || "inherit",
            }}
          >
            {element.content}
          </span>
        </div>
      )}

      {isSelected && (
        <>
          {/* 리사이즈 핸들 */}
          <div
            className="absolute w-6 h-6 bg-white border border-primary rounded-full right-0 bottom-0 cursor-se-resize flex items-center justify-center"
            onMouseDown={(e) => handleResizeStart(e, "se")}
            onTouchStart={(e) => handleResizeStart(e, "se")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="21 14 21 21 14 21" />
              <polyline points="3 10 3 3 10 3" />
              <line x1="21" y1="21" x2="14" y2="14" />
              <line x1="3" y1="3" x2="10" y2="10" />
            </svg>
          </div>

          {/* 회전 핸들 - 크기와 위치 조정 */}
          <div
            className="absolute w-8 h-8 bg-white border border-primary rounded-full -top-10 left-1/2 -translate-x-1/2 cursor-pointer flex items-center justify-center shadow-sm"
            onMouseDown={handleRotateStart}
            onTouchStart={handleRotateStart}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </div>

          {/* 삭제 버튼 */}
          <div
            className="absolute w-6 h-6 bg-white border border-red-500 rounded-full left-0 top-0 cursor-pointer flex items-center justify-center text-red-500"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>
        </>
      )}
    </div>
  )
})
