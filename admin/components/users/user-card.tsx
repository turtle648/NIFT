"use client";

import NextImage from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, User } from "lucide-react"
import type { User as UserType } from "@/lib/users"
import { useState } from "react"

interface UserCardProps {
  user: UserType
}

export default function UserCard({ user }: UserCardProps) {
  const [imgError, setImgError] = useState(false)
  const profileSrc = !user.profileImage || imgError
    ? "/unknown.jpg"
    : user.profileImage

  // 상태에 따른 배지 스타일 설정
  const getStatusBadge = (role: number) => {
    switch (role) {
      case 0:
        return <Badge className="bg-green-500">사용자</Badge>
      case 1:
        return <Badge variant="secondary">사업장</Badge>
      case 2:
        return <Badge variant="destructive">정지</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative h-48 bg-gray-100">
      <NextImage
        src={profileSrc}
        alt={user.nickName}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{user.nickName}</h3>
          {getStatusBadge(user.role)}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span>
              {user.age}세 / {user.gender === "male" ? "남성" : user.gender === "female" ? "여성" : "기타"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-gray-400" />
            <span className="truncate" title={user.walletAddress}>
              {user.walletAddress.substring(0, 8)}...{user.walletAddress.substring(user.walletAddress.length - 6)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

