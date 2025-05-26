"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// 백엔드 API 요청 함수 타입 정의

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const sendKakaoTokenToBackend = async (accessToken: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      // ✅ 백엔드 URL 직접 입력
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      throw new Error("백엔드 로그인 요청 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("로그인 에러:", error);
    return null;
  }
};

const KakaoCallback: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const getKakaoToken = async () => {
      const code = new URL(window.location.href).searchParams.get("code");
      if (!code) return;

      try {
        const response = await fetch("https://kauth.kakao.com/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || "",
            redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || "",
            code,
          }),
        });

        const data: { access_token?: string } = await response.json();
        console.log("카카오 토큰:", data);

        if (!data.access_token) {
          throw new Error("카카오 액세스 토큰을 가져오지 못했습니다.");
        }

        localStorage.setItem("kakao_access_token", data.access_token);

        window.dispatchEvent(new Event("storage"));

        // 백엔드로 토큰 보내기
        const userInfo = await sendKakaoTokenToBackend(data.access_token);
        console.log("백엔드 응답 확인:", userInfo);

        // JWT 토큰을 localStorage에 저장
        localStorage.setItem("access_token", userInfo.token);

        // 로그인 상태 변경을 위해 storage 이벤트 발생시키기
        window.dispatchEvent(new Event("storage"));

        router.push("/");
      } catch (error) {
        console.error("카카오 로그인 실패:", error);
      }
    };

    getKakaoToken();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Image
        src="/loadingspinner.gif"
        alt="로딩 중..."
        width={64}
        height={64}
        unoptimized
      />
    </div>
  );
};

export default KakaoCallback;
