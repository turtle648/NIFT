"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// 상품 타입 정의
export interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  brand: string
  image: string
  stock: number
  validity: string
  nftDetails: {
    blockchain: string
    tokenId: string
    contract: string
    minted: string
  }
  createdAt: string
  updatedAt: string
}

// 초기 상품 데이터
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Starbucks 아메리카노",
    price: 4500,
    description: "스타벅스 아메리카노 기프티콘입니다. 전국 스타벅스 매장에서 사용 가능합니다.",
    category: "커피",
    brand: "Starbucks",
    image: "/placeholder.svg?height=200&width=200",
    stock: 250,
    validity: "2025-12-31",
    nftDetails: {
      blockchain: "Ethereum",
      tokenId: "ETH-NFT-1234567890",
      contract: "0x1234567890abcdef1234567890abcdef12345678",
      minted: "2023-10-15",
    },
    createdAt: "2023-10-15",
    updatedAt: "2023-10-15",
  },
  {
    id: "2",
    name: "CGV 영화 티켓",
    price: 12000,
    description: "CGV 영화관에서 사용 가능한 영화 티켓입니다.",
    category: "영화",
    brand: "CGV",
    image: "/placeholder.svg?height=200&width=200",
    stock: 100,
    validity: "2025-12-31",
    nftDetails: {
      blockchain: "Ethereum",
      tokenId: "ETH-NFT-2345678901",
      contract: "0x1234567890abcdef1234567890abcdef12345678",
      minted: "2023-10-16",
    },
    createdAt: "2023-10-16",
    updatedAt: "2023-10-16",
  },
  {
    id: "3",
    name: "배스킨라빈스 파인트",
    price: 9900,
    description: "배스킨라빈스 파인트 아이스크림 교환권입니다.",
    category: "음식",
    brand: "배스킨라빈스",
    image: "/placeholder.svg?height=200&width=200",
    stock: 80,
    validity: "2025-12-31",
    nftDetails: {
      blockchain: "Ethereum",
      tokenId: "ETH-NFT-3456789012",
      contract: "0x1234567890abcdef1234567890abcdef12345678",
      minted: "2023-10-17",
    },
    createdAt: "2023-10-17",
    updatedAt: "2023-10-17",
  },
  {
    id: "4",
    name: "BBQ 치킨 기프티콘",
    price: 18000,
    description: "BBQ 치킨 교환권입니다. 전국 BBQ 매장에서 사용 가능합니다.",
    category: "음식",
    brand: "BBQ",
    image: "/placeholder.svg?height=200&width=200",
    stock: 50,
    validity: "2025-12-31",
    nftDetails: {
      blockchain: "Ethereum",
      tokenId: "ETH-NFT-4567890123",
      contract: "0x1234567890abcdef1234567890abcdef12345678",
      minted: "2023-10-18",
    },
    createdAt: "2023-10-18",
    updatedAt: "2023-10-18",
  },
]

// 로컬 스토리지 키
const STORAGE_KEY = "nft-products"

// 컨텍스트 타입 정의
interface ProductContextType {
  products: Product[]
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void
  getProduct: (id: string) => Product | undefined
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getCategories: () => string[]
  getBrands: () => string[]
  filterProducts: (category?: string, brand?: string, searchTerm?: string) => Product[]
  isLoading: boolean
}

// 컨텍스트 생성
const ProductContext = createContext<ProductContextType>({
  products: initialProducts,
  addProduct: () => {},
  getProduct: () => undefined,
  updateProduct: () => {},
  deleteProduct: () => {},
  getCategories: () => [],
  getBrands: () => [],
  filterProducts: () => [],
  isLoading: false,
})

// 로컬 스토리지에서 상품 데이터 가져오기
const getProductsFromStorage = (): Product[] => {
  if (typeof window === "undefined") {
    return initialProducts
  }

  try {
    const storedProducts = localStorage.getItem(STORAGE_KEY)
    if (!storedProducts) {
      // 로컬 스토리지에 데이터가 없으면 초기 데이터 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts))
      return initialProducts
    }
    return JSON.parse(storedProducts)
  } catch (error) {
    console.error("로컬 스토리지 접근 오류:", error)
    return initialProducts
  }
}

// 컨텍스트 프로바이더 컴포넌트
export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const loadProducts = () => {
      // 브라우저 환경에서만 실행
      if (typeof window !== "undefined") {
        try {
          const storedProducts = localStorage.getItem(STORAGE_KEY)
          if (storedProducts) {
            setProducts(JSON.parse(storedProducts))
          } else {
            // 로컬 스토리지에 데이터가 없으면 초기 데이터 저장
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts))
            setProducts(initialProducts)
          }
        } catch (error) {
          console.error("로컬 스토리지 접근 오류:", error)
          setProducts(initialProducts)
        }
      } else {
        setProducts(initialProducts)
      }
      setIsLoading(false)
    }

    loadProducts()
  }, [])

  // 새 상품 추가
  const addProduct = (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString().split("T")[0]
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    }

    const updatedProducts = [newProduct, ...products]
    setProducts(updatedProducts)

    // 로컬 스토리지에 저장
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts))
    } catch (error) {
      console.error("로컬 스토리지 저장 오류:", error)
    }
  }

  // ID로 상품 조회
  const getProduct = (id: string) => {
    return products.find((product) => product.id === id)
  }

  // 상품 업데이트
  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    const updatedProducts = products.map((product) =>
      product.id === id
        ? {
            ...product,
            ...updatedFields,
            updatedAt: new Date().toISOString().split("T")[0],
          }
        : product,
    )

    setProducts(updatedProducts)

    // 로컬 스토리지에 저장
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts))
    } catch (error) {
      console.error("로컬 스토리지 저장 오류:", error)
    }
  }

  // 상품 삭제
  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id)
    setProducts(updatedProducts)

    // 로컬 스토리지에 저장
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts))
    } catch (error) {
      console.error("로컬 스토리지 저장 오류:", error)
    }
  }

  // 모든 카테고리 목록 가져오기
  const getCategories = () => {
    const categories = new Set(products.map((product) => product.category))
    return Array.from(categories)
  }

  // 모든 브랜드 목록 가져오기
  const getBrands = () => {
    const brands = new Set(products.map((product) => product.brand))
    return Array.from(brands)
  }

  // 상품 필터링
  const filterProducts = (category?: string, brand?: string, searchTerm?: string) => {
    return products.filter((product) => {
      // 카테고리 필터링
      const matchCategory = !category || category === "all" || product.category === category

      // 브랜드 필터링
      const matchBrand = !brand || brand === "all" || product.brand === brand

      // 검색어 필터링 (상품명 또는 설명에 검색어가 포함되어 있는지)
      const matchSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())

      // 모든 조건을 만족하는 상품만 반환
      return matchCategory && matchBrand && matchSearch
    })
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        getProduct,
        updateProduct,
        deleteProduct,
        getCategories,
        getBrands,
        filterProducts,
        isLoading,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

// 커스텀 훅
export function useProducts() {
  return useContext(ProductContext)
}