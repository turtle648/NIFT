"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { GiftMemoryCard } from "../gift-memory-card"
import { Button } from "@/components/ui/button"
import type { GiftMemory } from "@/types/gift-memory"

interface GiftUnboxAnimationProps {
  gift: GiftMemory
  onComplete: () => void
}

export function GiftUnboxAnimation({ gift, onComplete }: GiftUnboxAnimationProps) {
  const [animationStage, setAnimationStage] = useState<
    "idle" | "shake1" | "shake2" | "burst" | "reveal-card" | "reveal-item" | "complete"
  >("idle")
  const [showAcceptButton, setShowAcceptButton] = useState(false)

  useEffect(() => {
    // 애니메이션 시퀀스 시작
    const sequence = async () => {
      // 초기 대기
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 첫 번째 흔들기 애니메이션
      setAnimationStage("shake1")
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 두 번째 흔들기 애니메이션 (더 강하게)
      setAnimationStage("shake2")
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 상자가 터지고 빛이 나오는 애니메이션
      setAnimationStage("burst")
      await new Promise((resolve) => setTimeout(resolve, 2200))

      // 카드 나타나기 애니메이션 (순서 변경)
      setAnimationStage("reveal-card")
      await new Promise((resolve) => setTimeout(resolve, 1200))

      // 상품 나타나기 애니메이션 (순서 변경)
      setAnimationStage("reveal-item")
      await new Promise((resolve) => setTimeout(resolve, 1700))

      // 완료 및 버튼 표시
      setAnimationStage("complete")
      setShowAcceptButton(true)
    }

    sequence()
  }, [])

  // 선물 상자 흔들림 애니메이션 변수
  const shakeAnimation = {
    idle: {},
    shake1: {
      rotate: [0, -3, 3, -3, 3, -2, 2, -1, 1, 0],
      y: [0, -2, 0, -2, 0],
      transition: {
        duration: 1.2,
        ease: "easeInOut",
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
      },
    },
    shake2: {
      rotate: [0, -5, 5, -5, 5, -3, 3, -2, 2, 0],
      y: [0, -4, 0, -4, 0],
      transition: {
        duration: 1.2,
        ease: "easeInOut",
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
      },
    },
    burst: {},
    "reveal-card": {},
    "reveal-item": {},
    complete: {},
  }

  // 선물 상자 뚜껑 애니메이션 변수
  const lidAnimation = {
    idle: { y: 0, opacity: 1 },
    shake1: { y: 0, opacity: 1 },
    shake2: { y: 0, opacity: 1 },
    burst: {
      y: -150,
      x: 50,
      rotate: 45,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    "reveal-card": { opacity: 0 },
    "reveal-item": { opacity: 0 },
    complete: { opacity: 0 },
  }

  // 선물 상자 본체 애니메이션 변수
  const boxAnimation = {
    idle: { opacity: 1, scale: 1 },
    shake1: { opacity: 1, scale: 1 },
    shake2: { opacity: 1, scale: 1 },
    burst: {
      opacity: 0,
      scale: 1.2,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3,
      },
    },
    "reveal-card": { opacity: 0 },
    "reveal-item": { opacity: 0 },
    complete: { opacity: 0 },
  }

  // 빛나는 효과 애니메이션 변수 (상자 안에서 나오는 빛)
  const innerGlowAnimation = {
    idle: { opacity: 0, scale: 0 },
    shake1: { opacity: 0, scale: 0 },
    shake2: { opacity: 0, scale: 0 },
    burst: {
      opacity: [0, 1, 0.8],
      scale: [0.2, 1.5, 1.8],
      transition: {
        duration: 1.2,
        ease: "easeOut",
        times: [0, 0.4, 1],
      },
    },
    "reveal-card": {
      opacity: 0.3,
      scale: 1.5,
      transition: { duration: 0.5 },
    },
    "reveal-item": {
      opacity: 0,
      scale: 0,
      transition: { duration: 0.3 },
    },
    complete: { opacity: 0 },
  }

  // 상자 아래에서 나오는 빛 애니메이션
  const bottomGlowAnimation = {
    idle: { opacity: 0, scale: 0 },
    shake1: { opacity: 0, scale: 0 },
    shake2: { opacity: 0, scale: 0 },
    burst: {
      opacity: [0, 0.8, 0.6],
      scale: [0.5, 1.2, 1.5],
      transition: {
        duration: 1.2,
        ease: "easeOut",
        times: [0, 0.4, 1],
      },
    },
    "reveal-card": {
      opacity: 0.2,
      scale: 1.2,
      transition: { duration: 0.5 },
    },
    "reveal-item": {
      opacity: 0,
      scale: 0,
      transition: { duration: 0.3 },
    },
    complete: { opacity: 0 },
  }

  // 카드 나타나기 애니메이션 변수
  const cardAnimation = {
    idle: { scale: 0, y: 0, opacity: 0 },
    shake1: { scale: 0, y: 0, opacity: 0 },
    shake2: { scale: 0, y: 0, opacity: 0 },
    burst: { scale: 0, y: 0, opacity: 0 },
    "reveal-card": {
      scale: 1,
      y: -120,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    "reveal-item": {
      scale: 1,
      y: -120,
      opacity: 1,
    },
    complete: {
      scale: 1,
      y: -120,
      opacity: 1,
    },
  }

  // 상품 나타나기 애니메이션 변수
  const itemAnimation = {
    idle: { scale: 0, y: 0, opacity: 0 },
    shake1: { scale: 0, y: 0, opacity: 0 },
    shake2: { scale: 0, y: 0, opacity: 0 },
    burst: { scale: 0, y: 0, opacity: 0 },
    "reveal-card": { scale: 0, y: 0, opacity: 0 },
    "reveal-item": {
      scale: 1,
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    complete: {
      scale: 1,
      y: 0,
      opacity: 1,
    },
  }

  // 버튼 애니메이션 변수
  const buttonAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.5,
      },
    },
  }

  // 반짝이는 별 생성 함수
  const renderStars = () => {
    const stars = []
    for (let i = 0; i < 20; i++) {
      const size = Math.random() * 4 + 2
      const left = Math.random() * 100
      const top = Math.random() * 100
      const delay = Math.random() * 1
      const duration = Math.random() * 1 + 1

      stars.push(
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: size,
            height: size,
            left: `${left}%`,
            top: `${top}%`,
            boxShadow: `0 0 ${size}px ${size / 2}px rgba(255, 255, 255, 0.8)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            animationStage === "burst"
              ? {
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  transition: {
                    duration: duration,
                    delay: delay,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: Math.random() * 2,
                  },
                }
              : { opacity: 0 }
          }
        />,
      )
    }
    return stars
  }

  // 빛 광선 생성 함수
  const renderLightRays = () => {
    const rays = []
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) % 360
      const width = Math.random() * 30 + 70
      const height = Math.random() * 2 + 1

      rays.push(
        <motion.div
          key={i}
          className="absolute bg-gradient-to-r from-yellow-100 to-transparent"
          style={{
            width: width,
            height: height,
            left: "50%",
            top: "50%",
            transformOrigin: "0 0",
            transform: `rotate(${angle}deg)`,
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={
            animationStage === "burst"
              ? {
                  opacity: [0, 0.7, 0.5],
                  scaleX: [0, 1, 0.8],
                  transition: {
                    duration: 1.2,
                    ease: "easeOut",
                    times: [0, 0.4, 1],
                  },
                }
              : { opacity: 0 }
          }
        />,
      )
    }
    return rays
  }

  return (
    <div className="relative w-[390px] h-[360px] flex items-center justify-center overflow-hidden">
      {/* 배경 효과 */}
      <motion.div
        className="absolute inset-0 bg-black rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* 상자 안에서 나오는 빛 */}
      <motion.div
        className="absolute top-1/3 left-2/6 transform -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] bg-white rounded-full filter blur-md"
        variants={innerGlowAnimation}
        animate={animationStage}
        style={{ zIndex: 1 }}
      />

      {/* 반짝이는 별 효과 */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        {renderStars()}
      </div>

      {/* 선물 상자 컨테이너 */}
      <motion.div
        className="relative w-[160px] h-[160px]"
        variants={shakeAnimation}
        animate={animationStage}
        style={{ zIndex: 4 }}
      >
        {/* 선물 상자 본체 */}
        <motion.div className="relative w-full h-full" variants={boxAnimation} animate={animationStage}>
          <div className="relative w-[160px] h-[160px]">
            {/* 선물 상자 본체 */}
            <div className="absolute top-[60px] left-0 w-[160px] h-[100px] bg-white rounded-lg overflow-hidden">
              {/* 세로 리본 */}
              <div className="absolute left-[70px] top-0 bottom-0 w-[20px] bg-rose-500"></div>
            </div>
          </div>
        </motion.div>

        {/* 선물 상자 뚜껑과 리본을 함께 그룹화 */}
        <motion.div
          className="absolute top-0 left-0 w-full"
          variants={lidAnimation}
          animate={animationStage}
          initial={{ y: 0, x: 0, opacity: 1 }}
        >
          <div className="relative w-[160px] h-[60px]">
            {/* 뚜껑 */}
            <div className="absolute top-[20px] left-0 w-[160px] h-[40px] bg-white rounded-t-lg overflow-hidden">
              {/* 세로 리본 - 뚜껑 부분 */}
              <div className="absolute left-[70px] top-0 bottom-0 w-[20px] bg-rose-500"></div>
            </div>

            {/* 리본 이미지 - 위치 조정됨 */}
            <div className="absolute top-[0px] left-[30px]">
              <Image src="/images/ribbon2.png" alt="Gift Ribbon" width={100} height={80} className="object-contain" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 카드 */}
      <motion.div
        className="absolute top-1/2 right-1/3 transform -translate-x-1/2 -translate-y-[60%]"
        variants={cardAnimation}
        animate={animationStage}
        style={{ zIndex: 4 }}
      >
        {/* 카드 컨테이너: 원하는 너비, 높이, 배경색, 텍스트, 이미지 등 */}
        <div className="relative w-[250px] h-[180px] rounded-lg shadow-lg overflow-hidden">
          <img
              src="/letter.png"
              alt="Gift Card Background"
              className="w-full h-full object-cover"
            />
        </div>
      </motion.div>

      {/* 상품 아이템 */}
      <motion.div
        className="absolute top-2/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2"
        variants={itemAnimation}
        animate={animationStage}
        style={{ zIndex: 5 }}
      >
        <div className="bg-white p-3 rounded-lg shadow-md">
          <div className="flex items-center gap-5">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={gift.giftItem?.image || "/placeholder.svg"}
                alt={gift.giftItem?.title || ""}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-medium text-sm">{gift.giftItem?.title}</h4>
              <p className="text-xs text-gray-500">{gift.giftItem?.brand}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 상품 받기 버튼 */}
      <AnimatePresence>
        {showAcceptButton && (
          <motion.div
            className="absolute bottom-4 left-0 right-0 flex justify-center"
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: 10 }}
            variants={buttonAnimation}
            style={{ zIndex: 12 }}
          >
            <Button onClick={onComplete} className="bg-rose-500 hover:bg-rose-600">
              상품 받기
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

