export interface GiftMemory {
    id: string
    senderName: string
    senderNickname: string
    receiverName?: string
    receiverNickname?: string
    sentDate: string
    acceptedDate?: string
    isAccepted: boolean
    cardData?: {
      frontTemplate: {
        background: string
      }
      backTemplate: {
        background: string
      }
      frontElements: any[]
      backElements: any[]
      frontImage?: string // base64 이미지 추가
      backImage?: string // base64 이미지 추가
    }
    giftItem?: {
      id: string
      title: string
      image: string
      brand?: string
      price?: number
    }
  }
