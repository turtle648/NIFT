'use client';

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-500 mb-6">
        요청하신 페이지가 존재하지 않거나, 이동되었을 수 있습니다.
      </p>
      <Link href="/" className="text-blue-600 underline">
        홈으로 돌아가기
      </Link>
    </div>
  );
}