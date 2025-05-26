"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function EmptyState() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <Image src="/1.svg" alt="로그인 필요" width={120} height={120} priority />
      <p className="mt-4 text-lg font-semibold">로그인이 필요합니다!</p>
      <Button className="mt-4" onClick={() => router.push("/signin")}>
        로그인 하러 가기
      </Button>
    </div>
  )
}
