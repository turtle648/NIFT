package com.e101.nift.secondhand.model.dto.response;

public record DashBoardSummaryDto (
    long totalArticlesOnSale,
    long weeklySalesCount,
    long weeklyRevenue,
    long totalUsers
) {}
