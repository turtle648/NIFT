"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { v4 as uuidv4 } from "uuid"
import { CardElement as CardElementType } from "@/types"
import { cardTemplates } from "@/data/card-templates"

export function useCardEditor(giftId: string) {
  const [activeTab, setActiveTab] = useState("templates")
  const [selectedTemplate, setSelectedTemplate] = useState(cardTemplates[0])
  const [selectedBackTemplate, setSelectedBSackTemplate] = useState(cardTemplates[0])
  const [frontElements, setFrontElements] = useState<CardElementType[]>([])
  const [backElements, setBackElements] = useState<CardElementType[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [customBackground, setCustomBackground] = useState<string | null>(null)
  const [customBackBackground, setCustomBackBackground] = useState<string | null>(null)
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [editingTextContent, setEditingTextContent] = useState("")
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [cardScale, setCardScale] = useState(1)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const backBackgroundInputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // 선택된 요소 가져오기
  const selectedElement = useMemo(() => {
    return isFlipped
      ? backElements.find((el) => el.id === selectedElementId)
      : frontElements.find((el) => el.id === selectedElementId)
  }, [isFlipped, backElements, frontElements, selectedElementId])

  // 요소 선택 핸들러
  const handleSelectElement = useCallback(
    (id: string) => {
      setSelectedElementId(id)

      const element = isFlipped ? backElements.find((el) => el.id === id) : frontElements.find((el) => el.id === id)

      if (element?.type === "text") {
        setEditingTextId(id)
        setEditingTextContent(element.content || "")
        // 도구 탭으로 자동 전환
        setActiveTab("tools")
      } else {
        setEditingTextId(null)
      }
    },
    [isFlipped, backElements, frontElements],
  )

  // 요소 업데이트 핸들러
  const handleUpdateElement = useCallback(
    (updatedElement: CardElementType) => {
      if (isFlipped) {
        setBackElements((prev) => prev.map((el) => (el.id === updatedElement.id ? updatedElement : el)))
      } else {
        setFrontElements((prev) => prev.map((el) => (el.id === updatedElement.id ? updatedElement : el)))
      }
    },
    [isFlipped],
  )

  // 요소 삭제 핸들러
  const handleDeleteElement = useCallback(
    (id: string) => {
      if (isFlipped) {
        setBackElements((prev) => prev.filter((el) => el.id !== id))
      } else {
        setFrontElements((prev) => prev.filter((el) => el.id !== id))
      }

      if (selectedElementId === id) {
        setSelectedElementId(null)
        setEditingTextId(null)
      }
    },
    [isFlipped, selectedElementId],
  )

  // 이미지 추가 핸들러
  const handleAddImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("이미지 크기는 5MB 이하여야 합니다.")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        if (!event.target?.result) {
          console.error("이미지를 읽을 수 없습니다.")
          return
        }

        try {
          const imageData = event.target.result as string

          // 이미지 데이터 유효성 검사
          if (!imageData.startsWith("data:image/")) {
            throw new Error("유효하지 않은 이미지 형식입니다.")
          }

          // 이미지 최적화 (크기 조정)
          const img = new Image()
          img.onload = () => {
            // 이미지 크기 최적화
            const canvas = document.createElement("canvas")
            const maxSize = 1200
            let width = img.width
            let height = img.height

            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = Math.round((height * maxSize) / width)
                width = maxSize
              } else {
                width = Math.round((width * maxSize) / height)
                height = maxSize
              }
            }

            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext("2d")
            ctx?.drawImage(img, 0, 0, width, height)

            // 최적화된 이미지 데이터
            const optimizedImageData = canvas.toDataURL("image/jpeg", 0.85)

            const newElement: CardElementType = {
              id: uuidv4(),
              type: "image",
              src: optimizedImageData,
              x: 50,
              y: 50,
              width: 150,
              height: 150,
              rotation: 0,
              zIndex: isFlipped ? backElements.length + 1 : frontElements.length + 1,
            }

            if (isFlipped) {
              setBackElements((prev) => [...prev, newElement])
            } else {
              setFrontElements((prev) => [...prev, newElement])
            }

            setSelectedElementId(newElement.id)
          }

          img.src = imageData
        } catch (error) {
          console.error("이미지 처리 중 오류 발생:", error)
          alert("이미지를 처리하는 중 오류가 발생했습니다.")
        }
      }

      reader.onerror = (error) => {
        console.error("이미지 읽기 오류:", error)
        alert("이미지를 읽을 수 없습니다.")
      }

      reader.readAsDataURL(file)
    },
    [isFlipped, backElements.length, frontElements.length],
  )

  // 배경 이미지 추가 핸들러
  const handleAddBackgroundImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      // 이미지 로드 후 처리
      const img = new Image()
      img.onload = () => {
        if (isFlipped) {
          setCustomBackBackground(event.target?.result as string)
        } else {
          setCustomBackground(event.target?.result as string)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // 배경 이미지 제거 핸들러
  const handleRemoveBackgroundImage = () => {
    if (isFlipped) {
      setCustomBackBackground(null)
    } else {
      setCustomBackground(null)
    }
  }

  // 스티커 추가 핸들러
  const handleAddSticker = useCallback(
    (sticker: { id: string; src: string }) => {
      // 카드 중앙에 스티커 배치
      const newElement: CardElementType = {
        id: uuidv4(),
        type: "sticker",
        src: sticker.src,
        x: 160, // 카드 중앙 (400/2 - 40)
        y: 110, // 카드 중앙 (300/2 - 40)
        width: 80,
        height: 80,
        rotation: 0,
        zIndex: isFlipped ? backElements.length + 1 : frontElements.length + 1,
      }

      if (isFlipped) {
        setBackElements((prev) => [...prev, newElement])
      } else {
        setFrontElements((prev) => [...prev, newElement])
      }

      setSelectedElementId(newElement.id)
    },
    [isFlipped, backElements.length, frontElements.length],
  )

  // 텍스트 추가 핸들러
  const handleAddText = useCallback(() => {
    const newElement: CardElementType = {
      id: uuidv4(),
      type: "text",
      content: "텍스트를 입력하세요",
      x: 100,
      y: 125, // 카드 중앙에 가깝게 배치
      width: 200,
      height: 50,
      rotation: 0,
      zIndex: isFlipped ? backElements.length + 1 : frontElements.length + 1,
      fontFamily: "inherit", // 기본 글꼴
    }

    if (isFlipped) {
      setBackElements((prev) => [...prev, newElement])
    } else {
      setFrontElements((prev) => [...prev, newElement])
    }

    setSelectedElementId(newElement.id)
    setEditingTextId(newElement.id)
    setEditingTextContent(newElement.content || "")
    // 도구 탭으로 자동 전환
    setActiveTab("tools")
  }, [isFlipped, backElements.length, frontElements.length])

  // 텍스트 내용 변경 핸들러 - 입력 필드 값이 변경될 때마다 호출
  const handleTextContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value
    setEditingTextContent(newContent)

    // 실시간으로 텍스트 내용 업데이트
    if (editingTextId) {
      if (isFlipped) {
        const updatedElements = backElements.map((el) =>
          el.id === editingTextId ? { ...el, content: newContent } : el,
        )
        setBackElements(updatedElements)
      } else {
        const updatedElements = frontElements.map((el) =>
          el.id === editingTextId ? { ...el, content: newContent } : el,
        )
        setFrontElements(updatedElements)
      }
    }
  }

  // 글꼴 변경 핸들러
  const handleFontChange = (fontFamily: string) => {
    if (!selectedElementId) return

    const selectedElement = isFlipped
      ? backElements.find((el) => el.id === selectedElementId)
      : frontElements.find((el) => el.id === selectedElementId)

    if (!selectedElement || selectedElement.type !== "text") return

    if (isFlipped) {
      const updatedElements = backElements.map((el) => (el.id === selectedElementId ? { ...el, fontFamily } : el))
      setBackElements(updatedElements)
    } else {
      const updatedElements = frontElements.map((el) => (el.id === selectedElementId ? { ...el, fontFamily } : el))
      setFrontElements(updatedElements)
    }
  }

  // 템플릿 변경 핸들러
  const handleChangeTemplate = useCallback(
    (template: typeof selectedTemplate) => {
      if (isFlipped) {
        setSelectedBSackTemplate(template)
        // 사용자 정의 템플릿이 아닌 경우 배경 이미지 초기화
        if (!template.isCustom) {
          setCustomBackBackground(null)
        }
      } else {
        setSelectedTemplate(template)
        // 사용자 정의 템플릿이 아닌 경우 배경 이미지 초기화
        if (!template.isCustom) {
          setCustomBackground(null)
        }
      }
    },
    [isFlipped],
  )

  // 카드 외부 클릭 시 선택 해제
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      setSelectedElementId(null)
      setEditingTextId(null)
    }
  }

  // 카드 뒤집기 핸들러
  const handleFlipCard = useCallback(() => {
    setIsFlipping(true)
    setSelectedElementId(null)
    setEditingTextId(null)

    // 애니메이션 완료 후 상태 변경
    setTimeout(() => {
      setIsFlipped((prev) => !prev)
      setIsFlipping(false)
    }, 400)
  }, [])

  // 메시지 변경 핸들러 - 뒷면에 메시지 자동 추가
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value
    setMessage(newMessage)

    // 뒷면에 메시지 요소가 있는지 확인
    const messageElement = backElements.find((el) => el.id === "message-element")

    if (messageElement) {
      // 기존 메시지 요소 업데이트
      const updatedElements = backElements.map((el) =>
        el.id === "message-element" ? { ...el, content: newMessage } : el,
      )
      setBackElements(updatedElements)
    } else if (newMessage) {
      // 새 메시지 요소 추가
      const newElement: CardElementType = {
        id: "message-element",
        type: "text",
        content: newMessage,
        x: 50,
        y: 120,
        width: 300,
        height: 150,
        rotation: 0,
        zIndex: backElements.length + 1,
        fontFamily: "'Gaegu', cursive", // 기본 글꼴을 손글씨로 설정
      }
      setBackElements((prev) => [...prev, newElement])
    }
  }

  // 받는 사람 변경 핸들러 - 뒷면에 받는 사람 자동 추가
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRecipient = e.target.value
    setRecipientName(newRecipient)

    // 뒷면에 받는 사람 요소가 있는지 확인
    const recipientElement = backElements.find((el) => el.id === "recipient-element")

    if (recipientElement) {
      // 기존 받는 사람 요소 업데이트
      const updatedElements = backElements.map((el) =>
        el.id === "recipient-element" ? { ...el, content: `To. ${newRecipient}` } : el,
      )
      setBackElements(updatedElements)
    } else if (newRecipient) {
      // 새 받는 사람 요소 추가
      const newElement: CardElementType = {
        id: "recipient-element",
        type: "text",
        content: `To. ${newRecipient}`,
        x: 50,
        y: 50,
        width: 300,
        height: 50,
        rotation: 0,
        zIndex: backElements.length + 1,
        fontFamily: "'Noto Serif KR', serif", // 기본 글꼴을 명조체로 설정
      }
      setBackElements((prev) => [...prev, newElement])
    }
  }

  // 선물 카드 저장 및 다음 단계로 이동
  const saveCardData = useCallback(() => {
    try {
      // 이미지 데이터 크기 확인 및 경고
      let totalSize = 0
      let largeImageFound = false

      // 앞면 요소 확인
      frontElements.forEach((el) => {
        if (el.type === "image" && el.src) {
          const size = (el.src.length * 2) / 1024 / 1024 // 대략적인 MB 크기
          totalSize += size
          if (size > 1) largeImageFound = true
        }
      })

      // 뒷면 요소 확인
      backElements.forEach((el) => {
        if (el.type === "image" && el.src) {
          const size = (el.src.length * 2) / 1024 / 1024 // 대략적인 MB 크기
          totalSize += size
          if (size > 1) largeImageFound = true
        }
      })

      // 경고 표시
      if (largeImageFound) {
        console.warn("큰 이미지가 포함되어 있습니다. 총 데이터 크기:", totalSize.toFixed(2) + "MB")
      }

      // 요소 배열이 비어있고 배경이 이미지인 경우 처리
      let finalFrontElements = [...frontElements]
      let finalBackElements = [...backElements]
      let finalFrontBackground = customBackground || selectedTemplate.background
      let finalBackBackground = customBackBackground || selectedBackTemplate.background

      // 앞면에 요소가 없고 배경이 이미지인 경우, 배경을 요소로 변환
      if (finalFrontElements.length === 0 && finalFrontBackground && finalFrontBackground.startsWith("data:image/")) {
        console.log("앞면 요소가 없고 배경이 이미지입니다. 요소로 변환합니다.")
        finalFrontElements = [
          {
            id: uuidv4(),
            type: "image",
            src: finalFrontBackground,
            x: 0,
            y: 0,
            width: 400,
            height: 300,
            rotation: 0,
            zIndex: 1,
          },
        ]
        finalFrontBackground = "white" // 배경을 흰색으로 설정
      }

      // 뒷면에 요소가 없고 배경이 이미지인 경우, 배경을 요소로 변환
      if (finalBackElements.length === 0 && finalBackBackground && finalBackBackground.startsWith("data:image/")) {
        console.log("뒷면 요소가 없고 배경이 이미지입니다. 요소로 변환합니다.")
        finalBackElements = [
          {
            id: uuidv4(),
            type: "image",
            src: finalBackBackground,
            x: 0,
            y: 0,
            width: 400,
            height: 300,
            rotation: 0,
            zIndex: 1,
          },
        ]
        finalBackBackground = "white" // 배경을 흰색으로 설정
      }

      // 카드 데이터 저장
      const cardData = {
        frontElements: finalFrontElements,
        backElements: finalBackElements,
        frontTemplate: {
          id: selectedTemplate.id,
          background: finalFrontBackground,
        },
        backTemplate: {
          id: selectedBackTemplate.id,
          background: finalBackBackground,
        },
        isFlipped,
        message,
        recipientName,
      }

      // localStorage에 카드 데이터 저장
      try {
        localStorage.setItem(`card-data-${giftId}`, JSON.stringify(cardData))
        console.log("카드 데이터가 성공적으로 저장되었습니다.")
        return true
      } catch (storageError) {
        console.error("localStorage 저장 오류:", storageError)
        alert("카드 데이터가 너무 큽니다. 이미지 크기를 줄이거나 개수를 줄여주세요.")
        return false
      }
    } catch (error) {
      console.error("카드 데이터 저장 중 오류 발생:", error)
      alert("카드 데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.")
      return false
    }
  }, [
    frontElements,
    backElements,
    customBackground,
    customBackBackground,
    selectedTemplate,
    selectedBackTemplate,
    isFlipped,
    message,
    recipientName,
    giftId,
  ])

  // 페이지 로드 시 localStorage에서 카드 데이터 불러오기
  useEffect(() => {
    // URL에서 쿼리 파라미터 확인
    const searchParams = new URLSearchParams(window.location.search)
    const isEditMode = searchParams.get("edit") === "true"

    // 수정 모드일 때만 저장된 데이터 불러오기
    if (isEditMode) {
      try {
        const savedCardData = localStorage.getItem(`card-data-${giftId}`)
        if (savedCardData) {
          const parsedData = JSON.parse(savedCardData)
          console.log("저장된 카드 데이터 불러오기:", parsedData)

          // 프론트 요소 설정
          if (parsedData.frontElements && Array.isArray(parsedData.frontElements)) {
            setFrontElements(parsedData.frontElements)
          }

          // 백 요소 설정
          if (parsedData.backElements && Array.isArray(parsedData.backElements)) {
            setBackElements(parsedData.backElements)
          }

          // 템플릿 설정
          if (parsedData.frontTemplate) {
            const frontTemplateId = parsedData.frontTemplate.id
            const foundTemplate = cardTemplates.find((t) => t.id === frontTemplateId) || cardTemplates[0]
            setSelectedTemplate(foundTemplate)

            // 커스텀 배경 설정
            if (
              parsedData.frontTemplate.background &&
              (parsedData.frontTemplate.background.startsWith("data:") ||
                parsedData.frontTemplate.background.startsWith("#"))
            ) {
              setCustomBackground(parsedData.frontTemplate.background)
            }
          }

          // 백 템플릿 설정
          if (parsedData.backTemplate) {
            const backTemplateId = parsedData.backTemplate.id
            const foundBackTemplate = cardTemplates.find((t) => t.id === backTemplateId) || cardTemplates[0]
            setSelectedBSackTemplate(foundBackTemplate)

            // 커스텀 배경 설정
            if (
              parsedData.backTemplate.background &&
              (parsedData.backTemplate.background.startsWith("data:") ||
                parsedData.backTemplate.background.startsWith("#"))
            ) {
              setCustomBackBackground(parsedData.backTemplate.background)
            }
          }

          // 메시지와 받는 사람 설정
          if (parsedData.message) {
            setMessage(parsedData.message)
          }

          if (parsedData.recipientName) {
            setRecipientName(parsedData.recipientName)
          }

          // 카드 뒤집기 상태 설정
          if (parsedData.isFlipped !== undefined) {
            setIsFlipped(parsedData.isFlipped)
          }
        }
      } catch (error) {
        console.error("카드 데이터 불러오기 실패:", error)
      }
    } else {
      // 수정 모드가 아닐 경우 기본값으로 초기화
      console.log("새로운 카드 만들기 모드")
      setFrontElements([])
      setBackElements([])
      setSelectedTemplate(cardTemplates[0])
      setSelectedBSackTemplate(cardTemplates[0])
      setCustomBackground(null)
      setCustomBackBackground(null)
      setMessage("")
      setRecipientName("")
      setIsFlipped(false)
    }
  }, [giftId])

  // 배경 클릭 시 선택 해제를 위한 이벤트 리스너
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // 편집기 영역 클릭은 무시
      if (editorRef.current && editorRef.current.contains(e.target as Node)) {
        return
      }

      // 카드 영역 외부 클릭 시 선택 해제
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setSelectedElementId(null)
        setEditingTextId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 텍스트 요소가 선택되면 텍스트 입력 필드에 포커스
  useEffect(() => {
    if (editingTextId && textInputRef.current) {
      textInputRef.current.focus()
    }
  }, [editingTextId])

  // 메시지나 받는 사람이 변경될 때 자동으로 뒷면에 요소 추가
  useEffect(() => {
    // 메시지가 있고 뒷면에 메시지 요소가 없는 경우
    if (message && !backElements.find((el) => el.id === "message-element")) {
      const newElement: CardElementType = {
        id: "message-element",
        type: "text",
        content: message,
        x: 50,
        y: 120,
        width: 300,
        height: 150,
        rotation: 0,
        zIndex: backElements.length + 1,
        fontFamily: "'Gaegu', cursive", // 기본 글꼴을 손글씨로 설정
      }
      setBackElements((prev) => [...prev, newElement])
    }

    // 받는 사람이 있고 뒷면에 받는 사람 요소가 없는 경우
    if (recipientName && !backElements.find((el) => el.id === "recipient-element")) {
      const newElement: CardElementType = {
        id: "recipient-element",
        type: "text",
        content: `To. ${recipientName}`,
        x: 50,
        y: 50,
        width: 300,
        height: 50,
        rotation: 0,
        zIndex: backElements.length + 1,
        fontFamily: "'Noto Serif KR', serif", // 기본 글꼴을 명조체로 설정
      }
      setBackElements((prev) => [...prev, newElement])
    }
  }, [message, recipientName, backElements])

  // 카드 크기 및 스케일 계산을 위한 useEffect
  useEffect(() => {
    const updateCardScale = () => {
      if (cardRef.current) {
        // 기준 크기 (데스크탑 기준 카드 크기)
        const baseWidth = 400 // 기준 카드 너비를 400px로 설정

        // 현재 컨테이너 크기
        const containerWidth = cardRef.current.clientWidth

        // 스케일 계산
        const scale = containerWidth / baseWidth
        setCardScale(scale)
      }
    }

    // 초기 로드 시 스케일 계산
    updateCardScale()

    // 윈도우 리사이즈 이벤트에 대한 리스너 추가
    const handleResize = () => {
      updateCardScale()
    }

    window.addEventListener("resize", handleResize)

    // 클린업 함수
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return {
    activeTab,
    setActiveTab,
    selectedTemplate,
    selectedBackTemplate,
    frontElements,
    backElements,
    selectedElementId,
    selectedElement,
    message,
    recipientName,
    customBackground,
    customBackBackground,
    editingTextId,
    editingTextContent,
    isFlipped,
    isFlipping,
    cardScale,
    fileInputRef,
    backgroundInputRef,
    backBackgroundInputRef,
    cardRef,
    textInputRef,
    editorRef,
    handleSelectElement,
    handleUpdateElement,
    handleDeleteElement,
    handleAddImage,
    handleAddBackgroundImage,
    handleRemoveBackgroundImage,
    handleAddSticker,
    handleAddText,
    handleTextContentChange,
    handleFontChange,
    handleChangeTemplate,
    handleCardClick,
    handleFlipCard,
    handleMessageChange,
    handleRecipientChange,
    saveCardData,
    // 추가: 외부에서 필요한 상태 설정 함수들 노출
    setSelectedElementId,
    setFrontElements,
    setBackElements,
  }
}

