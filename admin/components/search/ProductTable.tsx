import React, { useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { sendNft } from "@/lib/mintNFT";

interface User {
  userId: number;
  kakaoId: number;
  nickName: string;
  walletAddress: string;
  profileImage: string;
  gender: "male" | "female" | string;
  age: string;
  role: number;
}

export default function ProductTable({
  products,
  openMintModal,
}: {
  products: any[];
  openMintModal: (gifticon: any) => void;
}) {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [productUsers, setProductUsers] = useState<Record<number, any>>({});
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/with-address`
      );
      const data = await response.json();
      setUsers(data);
    };
    fetchData();
  }, []);

  const handleUserSelect = (
    productId: number,
    user: User,
    quantity: number
  ) => {
    // 실제 구현에서는 API 호출로 사용자 할당
    setProductUsers((prev) => ({
      ...prev,
      [productId]: {
        user,
        quantity,
      },
    }));
  };

  const toggleProductDetails = (productId: number) => {
    setSelectedProductId((prev) => (prev === productId ? null : productId));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setSelectedQuantity(value);
    }
  };

  const handleSend = async () => {
    const amount = selectedQuantity;
    const address = productUsers[Number(selectedProductId)].user.walletAddress;
    const tokenId = selectedProductId!;
    try {
      console.log("tokenId:" + tokenId);

      await sendNft(amount, address, tokenId);
      alert("✅ 전송 완료!");
    } catch (error) {
      console.error("❌ 전송 중 오류 발생:", error);
      alert("전송에 실패했습니다.");
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">번호</TableHead>
            <TableHead>기프티콘 이름</TableHead>
            <TableHead>브랜드</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead className="text-right">금액</TableHead>
            <TableHead>등록일시</TableHead>
            <TableHead className="text-center">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <React.Fragment key={product.gifticonId}>
              <TableRow
                className="cursor-pointer"
                onClick={() => {
                  console.log("클릭");

                  toggleProductDetails(product.gifticonId);
                }}
              >
                <TableCell className="text-center">
                  {product.gifticonId}
                </TableCell>
                <TableCell>{product.gifticonTitle ?? "제목 없음"}</TableCell>
                <TableCell>{product.brandName ?? "브랜드 없음"}</TableCell>
                <TableCell>{product.categoryName ?? "기타"}</TableCell>
                <TableCell className="text-right">
                  🪙 {
                    (() => {
                      const price = product.price;
                      const priceStr = price.toString();
                      const [intPart, decimalPart] = priceStr.split(".");

                      if (decimalPart && decimalPart.length > 2) {
                        return `${Number(price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}...`;
                      }

                      return Number(price).toLocaleString();
                    })()
                  }
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-gray-400" />
                    <span>
                      {product.createdAt ? product.createdAt + " 12:00" : "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Link href={`/products/${product.gifticonId}`}>
                      <Button
                        className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                        size="sm"
                      >
                        보기
                      </Button>
                    </Link>
                    <Link href={`/products/edit/${product.gifticonId}`}>
                      <Button
                        className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                        size="sm"
                      >
                        수정
                      </Button>
                    </Link>
                    <Button
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      size="sm"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        openMintModal(product);
                      }}
                    >
                      민팅
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {selectedProductId === product.gifticonId && (
                <TableRow>
                  <TableCell colSpan={7} className="bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">사용자 선택</div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`quantity-${product.gifticonId}`}
                            className="text-sm font-medium"
                          >
                            개수:
                          </label>
                          <Input
                            id={`quantity-${product.gifticonId}`}
                            type="number"
                            min="1"
                            value={selectedQuantity}
                            onChange={handleQuantityChange}
                            className="w-20"
                          />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-64"
                            >
                              {productUsers[product.gifticonId] ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={
                                        productUsers[product.gifticonId]?.user
                                          .avatar
                                      }
                                      alt={
                                        productUsers[product.gifticonId]?.user
                                          .name
                                      }
                                    />
                                    <AvatarFallback>
                                      {productUsers[
                                        product.gifticonId
                                      ]?.user.nickName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">
                                    {
                                      productUsers[product.gifticonId]?.user
                                        .nickName
                                    }
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    (
                                    {productUsers[product.gifticonId]?.quantity}
                                    개)
                                  </span>
                                </div>
                              ) : (
                                <span>사용자 선택</span>
                              )}
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 bg-white"
                          >
                            {users.map((user) => (
                              <DropdownMenuItem
                                key={user.userId}
                                onSelect={() => {
                                  handleUserSelect(
                                    product.gifticonId,
                                    user,
                                    selectedQuantity
                                  );
                                }}
                                className="flex items-center gap-2 py-2"
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {user.nickName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {user.nickName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {user.walletAddress.substring(0, 10) +
                                      "..."}
                                  </span>
                                </div>
                                {productUsers[product.id]?.user.userId ===
                                  user.userId && (
                                  <Check className="ml-auto h-4 w-4 text-green-500" />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <div>
                          <Button
                            className="bg-green-600 text-white hover:bg-green-700 mr-14 2xl:mr-[227px]"
                            size="sm"
                            onClick={handleSend}
                          >
                            전달
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
