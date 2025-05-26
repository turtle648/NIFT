"use client"

import { useEffect, useState } from "react"
import PageHeader from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, Copy, UserIcon, Grid, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import UserCard from "@/components/users/user-card"
import NextImage from "next/image"
import { fetchUsers } from "@/lib/users"
import type { User } from "@/lib/users"
import { toast } from "sonner"


export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedGender, setSelectedGender] = useState<string>("all")
  const [minAge, setMinAge] = useState<string>("")
  const [maxAge, setMaxAge] = useState<string>("")
  const [hasSearched, setHasSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers()
        setUsers(data)
        setFilteredUsers(data)
      } catch (e) {
        console.error("유저 불러오기 실패", e)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  const applyFilters = () => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        user.nickName.includes(searchTerm) ||
        user.walletAddress.includes(searchTerm) ||
        user.kakaoId.toString().includes(searchTerm)

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && user.role === 0) ||
        (selectedStatus === "inactive" && user.role === 1) ||
        (selectedStatus === "suspended" && user.role === 2)

      const matchesGender =
        selectedGender === "all" || user.gender === selectedGender

      const matchesAge =
        (!minAge || parseInt(user.age) >= parseInt(minAge)) &&
        (!maxAge || parseInt(user.age) <= parseInt(maxAge))

      return matchesSearch && matchesStatus && matchesGender && matchesAge
    })

    setFilteredUsers(filtered)
    setHasSearched(true)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedStatus("all")
    setSelectedGender("all")
    setMinAge("")
    setMaxAge("")
    setFilteredUsers(users)
    setHasSearched(false)
  }

  const activeFiltersCount =
    (selectedStatus !== "all" ? 1 : 0) +
    (selectedGender !== "all" ? 1 : 0) +
    (minAge ? 1 : 0) +
    (maxAge ? 1 : 0) +
    (searchTerm ? 1 : 0)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">데이터를 불러오는 중입니다...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="회원 관리" description="NFT 기프티콘샵 회원 정보를 관리합니다." />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              applyFilters()
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-10 pr-4"
                    placeholder="닉네임, 사용자 ID, 지갑 주소 등 검색어"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                  검색
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  필터
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
                >
                  {viewMode === "grid" ? (
                    <>
                      <List className="h-4 w-4 mr-2" />
                      테이블 보기
                    </>
                  ) : (
                    <>
                      <Grid className="h-4 w-4 mr-2" />
                      그리드 보기
                    </>
                  )}
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-4 bg-gray-50 rounded-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">회원 상태</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="전체" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="active">사용자</SelectItem>
                        <SelectItem value="inactive">사업장</SelectItem>
                        <SelectItem value="suspended">정지</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">성별</label>
                    <Select value={selectedGender} onValueChange={setSelectedGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="전체" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="male">남성</SelectItem>
                        <SelectItem value="female">여성</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end items-end md:col-span-3">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      <X className="h-4 w-4 mr-2" />
                      필터 초기화
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">
          {hasSearched ? `검색 결과: ${filteredUsers.length}명` : `전체 회원: ${users.length}명`}
        </h2>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">
            {hasSearched ? "검색 결과가 없습니다" : "등록된 회원이 없습니다"}
          </h3>
          <p className="text-gray-500 mt-2 mb-4">
            {hasSearched ? "다른 검색어나 필터를 사용해보세요." : "회원 데이터가 없습니다."}
          </p>
          {hasSearched && (
            <Button variant="outline" onClick={resetFilters}>
              모든 회원 보기
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredUsers.map((user) => (
            <UserCard key={user.userId} user={user} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">번호</TableHead>
                <TableHead>닉네임</TableHead>
                <TableHead className="text-center">나이</TableHead>
                <TableHead className="text-center">성별</TableHead>
                <TableHead>지갑 주소</TableHead>
                <TableHead className="text-center">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 relative">
                        <NextImage
                          src={user.profileImage || "/placeholder.svg?height=50&width=50"}
                          alt={user.nickName}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <span>{user.nickName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{user.age}</TableCell>
                  <TableCell className="text-center">
                    {user.gender === "male" ? "남성" : user.gender === "female" ? "여성" : "기타"}
                  </TableCell>
                  <TableCell className="font-mono text-xs flex items-center gap-1">
                  <span title={user.walletAddress}>
                    {user.walletAddress?.substring(0, 8)}...
                    {user.walletAddress?.substring(user.walletAddress.length - 4) || '주소 없음'}
                  </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user.walletAddress)
                        toast.success("지갑 주소가 복사되었습니다!")
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      type="button"
                    >
                      <Copy className="h-3 w-3 text-gray-500" />
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                  <Badge
                    variant={
                      user.role === 0 ? "default" : user.role === 1 ? "secondary" : "destructive"
                    }
                    className={`
                      ${user.role === 0 ? "bg-green-500" : ""}
                      text-white
                    `}
                  >
                    {user.role === 0 ? "사용자" : user.role === 1 ? "사업장" : "정지"}
                  </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
