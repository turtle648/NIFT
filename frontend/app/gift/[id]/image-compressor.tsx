"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import Image from "next/image";

interface ImageCompressorProps {
  onImageCompressed: (compressedImage: string) => void
  onCancel: () => void
}

export function ImageCompressor({ onImageCompressed, onCancel }: ImageCompressorProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [compressedImage, setCompressedImage] = useState<string | null>(null)
  const [quality, setQuality] = useState<number>(80)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [isCompressing, setIsCompressing] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("이미지 크기는 10MB 이하여야 합니다.")
      return
    }

    setOriginalSize(file.size)

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setOriginalImage(event.target.result as string)
        compressImage(event.target.result as string, quality)
      }
    }
    reader.readAsDataURL(file)
  }

  const compressImage = (imageData: string, imageQuality: number) => {
    setIsCompressing(true)

    const img = new window.Image()
    img.crossOrigin = "anonymous" // CORS 이슈 방지

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        // 이미지 최대 크기 제한 (1200px)
        let width = img.width
        let height = img.height
        const maxDimension = 1200

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height

        if (ctx) {
          // 배경을 투명하게 설정
          ctx.clearRect(0, 0, width, height)
          // 이미지 그리기
          ctx.drawImage(img, 0, 0, width, height)

          // 이미지 포맷 선택 (PNG는 투명도 지원, JPEG는 더 작은 파일 크기)
          const format = imageData.startsWith("data:image/png") ? "image/png" : "image/jpeg"
          const compressedDataUrl = canvas.toDataURL(format, imageQuality / 100)

          // 압축된 이미지 유효성 검사
          if (!compressedDataUrl.startsWith("data:image/")) {
            throw new Error("압축된 이미지 형식이 올바르지 않습니다.")
          }

          setCompressedImage(compressedDataUrl)

          // 압축된 이미지 크기 계산 (대략적인 계산)
          const compressedSizeInBytes = Math.round((compressedDataUrl.length * 3) / 4)
          setCompressedSize(compressedSizeInBytes)
        } else {
          throw new Error("Canvas 컨텍스트를 가져올 수 없습니다.")
        }
      } catch (error) {
        console.error("이미지 압축 중 오류:", error)
        alert("이미지 압축 중 오류가 발생했습니다.")
      } finally {
        setIsCompressing(false)
      }
    }

    img.onerror = (error: Event | string) => {
      console.error("이미지 로드 오류:", error)
      alert("이미지를 불러오는 중 오류가 발생했습니다.")
      setIsCompressing(false)
    }

    img.src = imageData
  }

  const handleQualityChange = (value: number[]) => {
    const newQuality = value[0]
    setQuality(newQuality)
    if (originalImage) {
      compressImage(originalImage, newQuality)
    }
  }

  const handleSubmit = () => {
    if (compressedImage) {
      onImageCompressed(compressedImage)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">이미지 최적화</h2>

      {!originalImage ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            이미지를 선택하면 자동으로 최적화됩니다. 최적화된 이미지는 카드에 더 잘 표시됩니다.
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="image-upload">이미지 선택</Label>
            <Input id="image-upload" type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">원본 이미지</p>
              <div className="aspect-square bg-gray-100 rounded-md overflow-hidden relative">
                <Image
                  src={originalImage || "/placeholder.svg"}
                  alt="Original"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                크기: {formatFileSize(originalSize)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">최적화된 이미지</p>
              <div className="aspect-square bg-gray-100 rounded-md overflow-hidden relative">
                {isCompressing ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
                  </div>
                ) : compressedImage ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={compressedImage || "/placeholder.svg"}
                      alt="Compressed"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : null}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                크기: {formatFileSize(compressedSize)}
                {originalSize > 0 && (
                  <span className="text-green-500 ml-1">
                    ({Math.round((1 - compressedSize / originalSize) * 100)}% 감소)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="quality">이미지 품질: {quality}%</Label>
            </div>
            <Slider
              id="quality"
              min={10}
              max={100}
              step={5}
              value={[quality]}
              onValueChange={handleQualityChange}
              disabled={isCompressing}
            />
            <p className="text-xs text-gray-500">
              품질을 낮추면 파일 크기가 줄어들지만 이미지 품질이 저하될 수 있습니다.
            </p>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} disabled={isCompressing}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={!compressedImage || isCompressing}>
              {isCompressing ? "처리 중..." : "이미지 적용하기"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

