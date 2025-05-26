"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const slides = [
  {
    id: 1,
    title: "NFT 기프티콘 중고거래",
    description: "안 쓰는 기프티콘, NFT로 거래해요",
    image: "/slide4.png?height=600&width=1200",
    cta: {
      text: "지금 시작하기",
      link: "/signin",
    },
    color: "bg-gradient-to-r from-primary/80 to-primary",
  },
  {
    id: 2,
    title: "기프티콘 선물하기",
    description: "카톡으로 손쉽게 선물하세요!",
    image: "/slide2.png?height=600&width=1200",
    cta: {
      text: "지금 선물하기",
      link: "/signin",
    },
    color: "bg-gradient-to-r from-blue-500/80 to-blue-600",
  },
  {
    id: 3,
    title: "안전한 블록체인 기술",
    description: "소유권과 사용여부까지 확인되는 NFT 거래",
    image: "/slide3.png?height=600&width=1200",
    cta: {
      text: "지금 알아보기",
      link: "/signin",
    },
    color: "bg-gradient-to-r from-purple-500/80 to-purple-600",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden">
      <div className="relative h-[260px] md:h-[280px] lg:h-[300px] w-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 flex items-center transition-opacity duration-1000",
              currentSlide === index ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <div className={cn("absolute inset-0 z-0", slide.color)} />
            <div className="absolute inset-0 z-0 opacity-50">
              <Image
                src={slide.image || "/placeholder.svg"}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
            <div className="container relative z-10 flex flex-col items-start justify-center gap-3 text-white">
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                {slide.title}
              </h1>
              <p className="max-w-md text-base md:text-base lg:text-lg opacity-90">{slide.description}</p>
              <Button
                size="lg"
                className="mt-1 bg-white hover:bg-white/90"
                style={{
                  color: slide.id === 1 ? "#E86040" : slide.id === 2 ? "#1556C7" : "#9A3CC2",
                }}
                asChild
              >
                <Link href={slide.cta.link}>{slide.cta.text}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="absolute left-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/30"
        onClick={prevSlide}
        aria-label="이전 슬라이드"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        className="absolute right-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/30"
        onClick={nextSlide}
        aria-label="다음 슬라이드"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              currentSlide === index ? "w-6 bg-white" : "bg-white/50",
            )}
            onClick={() => setCurrentSlide(index)}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  )
}

