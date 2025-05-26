"use client"; 

import { createContext, useContext, useState, ReactNode } from "react";
import Image from "next/image";

// 로딩 상태 컨텍스트 생성
const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: (loading: boolean) => {},
});

// 로딩 프로바이더 정의
export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <Image src="/loadingspinner.gif" alt="로딩스피너" width={100} height={100} unoptimized priority/>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};

// 커스텀 훅: 로딩 컨텍스트 사용
export const useLoading = () => useContext(LoadingContext);
