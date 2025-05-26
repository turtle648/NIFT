"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedCategories } from "@/components/home/featured-categories"
import { RecentlyListed } from "@/components/home/recently-listed"
import { PopularArticles } from "@/components/home/popular-articles"


export default function Home() {
  useEffect(() => {
    // localStorage에서 카카오 토큰을 가져옵니다.
    const kakaoToken = localStorage.getItem("access_token");
    if (kakaoToken) {
      console.log("홈페이지에 찍힌 토큰:", kakaoToken);
    } else {
      console.log("홈페이지에 찍힌 토큰: null");
    }
  }, []);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedCategories />
        <RecentlyListed />
        <PopularArticles />
        {/* <NearbyItems /> */}
      </main>
      <Footer />
    </div>
  )
}

