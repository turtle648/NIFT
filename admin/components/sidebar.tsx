"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, Search, ShoppingBag, Users, Settings, ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    상품관리: true,
  })

  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const MenuItem = ({
    href,
    title,
    icon,
    submenu = false,
  }: {
    href: string
    title: string
    icon: React.ReactNode
    submenu?: boolean
  }) => {
    const isActive = pathname === href

    return (
      <Link href={href}>
        <div
          className={cn(
            "flex items-center px-4 py-3 text-sm",
            isActive ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-800",
            submenu && "pl-10",
          )}
        >
          <div className="mr-3">{icon}</div>
          <span>{title}</span>
        </div>
      </Link>
    )
  }

  const MenuGroup = ({
    title,
    icon,
    children,
  }: {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
  }) => {
    const isExpanded = expandedMenus[title] || false

    return (
      <div>
        <div
          className="flex items-center justify-between px-4 py-3 text-sm text-blue-100 hover:bg-blue-800 cursor-pointer"
          onClick={() => toggleMenu(title)}
        >
          <div className="flex items-center">
            <div className="mr-3">{icon}</div>
            <span>{title}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "transform rotate-180" : ""}`} />
        </div>
        {isExpanded && <div className="bg-blue-700">{children}</div>}
      </div>
    )
  }

  return (
    <aside className="w-64 bg-blue-700 text-white">
      <Link href="/"> 
        <div className="p-4 border-b border-blue-600">
          <h2 className="text-xl font-bold">NFT 기프티콘샵</h2>
          <p className="text-sm text-blue-200">관리자 페이지</p>
        </div>
      </Link>

      <nav className="mt-2">
        <MenuItem href="/" title="홈 대시보드" icon={<Home className="w-5 h-5" />} />

        <MenuGroup title="상품관리" icon={<Package className="w-5 h-5" />}>
          <MenuItem
            href="/products/register"
            title="상품 등록"
            icon={<ShoppingBag className="w-4 h-4" />}
            submenu={true}
          />
          <MenuItem href="/products/search" title="상품 검색" icon={<Search className="w-4 h-4" />} submenu={true} />
        </MenuGroup>

        <MenuItem href="/users" title="회원관리" icon={<Users className="w-5 h-5" />} />

        <MenuItem href="/settings" title="설정" icon={<Settings className="w-5 h-5" />} />
      </nav>
    </aside>
  )
}

