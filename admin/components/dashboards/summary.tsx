"use client";

import React, { useEffect, useState } from "react";
import { Package, ShoppingCart, BadgeDollarSign, Users } from "lucide-react";
import StatsCard from "@/components/stats-card";
import { fetchDashboardSummary } from "@/lib/dashboard";

export default function DashboardStats() {
    const [summary, setSummary] = useState({
      totalArticlesOnSale: 0,
      weeklySalesCount: 0,
      weeklyRevenue: 0,
      totalUsers: 0,
    });
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const load = async () => {
        try {
          const data = await fetchDashboardSummary();
          setSummary(data);
        } catch (e) {
          console.error("Failed to fetch dashboard summary", e);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, []);
  
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-pulse">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-gray-100 h-24 rounded-xl" />
          ))}
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="총 상품"
          value={summary.totalArticlesOnSale.toString()}
          icon={<Package className="h-5 w-5" />}
          description="등록된 총 상품 수"
        />
        <StatsCard
          title="주간 판매량"
          value={summary.weeklySalesCount.toString()}
          icon={<ShoppingCart className="h-5 w-5" />}
          description="이번 주 기준 판매량"
        />
        <StatsCard
          title="주간 매출"
          value={`🪙 ${summary.weeklyRevenue.toLocaleString()}`}
          icon={<BadgeDollarSign className="h-5 w-5" />}
          description="이번 주 매출 합계"
        />
        <StatsCard
          title="총 회원"
          value={summary.totalUsers.toString()}
          icon={<Users className="h-5 w-5" />}
          description="가입한 총 회원 수"
        />
      </div>
    );
  }