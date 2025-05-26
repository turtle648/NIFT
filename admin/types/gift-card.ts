export interface CardElement {
    id: string
    type: "image" | "sticker" | "text"
    src?: string
    content?: string
    x: number
    y: number 
    width: number
    height: number
    rotation: number
    zIndex: number
    fontFamily?: string // 글꼴 속성 추가
  }
  
  export interface CardTemplate {
    id: string
    name: string
    thumbnail: string
    background: string
    category: "birthday" | "congratulation" | "thanks" | "love" | "general"
    isCustom?: boolean
  }
  
  export interface StickerItem {
    id: string
    src: string
    category: string
  }
  
  