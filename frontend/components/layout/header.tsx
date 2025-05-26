"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Menu, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Coffee,
  Cake,
  IceCream,
  Drumstick,
  Pizza,
  ShoppingBag,
  Gift,
  Film,
} from "lucide-react";

const navigation = [
  { name: "홈", href: "/" },
  { name: "마이페이지", href: "/mypage" },
  { name: "상품등록", href: "/register" },
];

const categories = [
  { name: "전체 상품", href: "/articles" },
  { name: "커피/음료", href: "/articles?category=1" },
  { name: "베이커리/디저트", href: "/articles?category=2" },
  { name: "아이스크림/빙수", href: "/articles?category=3" },
  { name: "치킨", href: "/articles?category=4" },
  { name: "피자/버거", href: "/articles?category=5" },
  { name: "편의점/마트", href: "/articles?category=6" },
  { name: "상품권/금액권", href: "/articles?category=7" },
  { name: "영화/도서", href: "/articles?category=8" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      setIsAuthenticated(!!token);
    };

    checkAuth();

    // Add event listener to detect changes in localStorage
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Add logout handler function before the return statement
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("kakao_access_token");
    setIsAuthenticated(false);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10 overflow-hidden">
              <Image
                src="/1.png?height=40&width=40"
                alt="NIFT Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">
              NIFT
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-gray-900"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {/* <div className="relative w-55">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="상품 검색..."
              className="w-full rounded-full pl-8 md:w-64 lg:w-80"
            />
          </div> */}

          <Button variant="ghost" size="icon" aria-label="알림창">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            ) : (
              <>
                <Button size="sm" asChild>
                  <Link href="/signin">로그인</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <Sheet>
          <SheetTrigger
            asChild
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 overflow-y-auto max-h-screen scrollbar-hide"
          >
            <div className="grid gap-6 py-6">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden">
                  <Image
                    src="/1.png?height=32&width=32"
                    alt="NIFT Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight">NIFT</span>
              </div>

              <div className="grid gap-2">
                {/* <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="상품 검색..." className="w-full rounded-full bg-background pl-8" />
                </div> */}
                {/* Conditional rendering for mobile menu */}
                <div className="grid grid-cols-2 gap-2">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="col-span-2"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      로그아웃
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" asChild>
                        <Link href="/signin">로그인</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Rest of the mobile menu */}
              <div className="grid gap-2">
                <div className="text-lg font-semibold">메뉴</div>{" "}
                <nav className="grid gap-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        // ✅ 아래 조건 삭제하고 hover 효과만 남기기
                        // item.href === "/mypage"
                        //   ? "bg-primary/10 text-primary"
                        //   : "hover:bg-muted"
                        "hover:bg-muted"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="grid gap-2">
                <div className="text-lg font-semibold">카테고리</div>
                <nav className="grid gap-1">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === category.href
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-gray-100"
                      )}
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* 전체화면 전체상품보기 드롭다운 */}
      <div className="hidden md:block border-t">
        <div className="container relative" ref={dropdownRef}>
          <div className="flex h-12 items-center relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              {isDropdownOpen ? <X size={18} /> : <Menu size={18} />}
              카테고리
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-2">
                  <Link
                    href="/articles"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 mr-3 text-gray-500">
                      <LayoutGrid className="h-6 w-6" />
                    </div>
                    <span>전체 상품</span>
                  </Link>
                  {[
                    {
                      name: "커피/음료",
                      icon: <Coffee className="h-6 w-6" />,
                      href: "/articles?category=1&minPrice=0&maxPrice=9&sort=newest&page=1",
                      color: "bg-amber-100 text-amber-700",
                    },
                    {
                      name: "베이커리/디저트",
                      icon: <Cake className="h-6 w-6" />,
                      href: "/articles?category=2&minPrice=0&maxPrice=9&sort=newest&page=1",
                      color: "bg-blue-100 text-blue-700",
                    },
                    {
                      name: "아이스크림/빙수",
                      icon: <IceCream className="h-6 w-6" />,
                      href: "/articles?category=3&minPrice=0&maxPrice=9&sort=newest&page=1",
                      color: "bg-green-100 text-green-700",
                    },
                    {
                      name: "치킨",
                      icon: <Drumstick className="h-6 w-6" />,
                      href: "/articles?category=4&minPrice=0&maxPrice=9&sort=newest&page=1",
                      color: "bg-indigo-100 text-indigo-700",
                    },
                    {
                      name: "피자/버거",
                      icon: <Pizza className="h-6 w-6" />,
                      href: "/articles?category=5&minPrice=0&maxPrice=9&sort=newest&page=1",
                      color: "bg-red-100 text-red-700",
                    },
                    {
                      name: "편의점/마트",
                      icon: <ShoppingBag className="h-6 w-6" />,
                      href: "/articles?category=6&minPrice=0&maxPrice=9&sort=newest&page=1",
                      color: "bg-pink-100 text-pink-700",
                    },
                    {
                      name: "상품권/금액권",
                      icon: <Gift className="h-6 w-6" />,
                      href: "/articles?category=7&minPrice=0&maxPrice=9&sort=newest&page=1",
                      color: "bg-yellow-100 text-yellow-700",
                    },
                    {
                      name: "영화/도서",
                      icon: <Film className="h-6 w-6" />,
                      href: "/articles?category=8&minPrice=0&maxPrice=9&sort=newest&page=1",
                      color: "bg-purple-100 text-purple-700",
                    },
                  ].map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="flex items-center justify-center w-8 h-8 mr-3 text-gray-500">
                        {category.icon}
                      </div>
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
