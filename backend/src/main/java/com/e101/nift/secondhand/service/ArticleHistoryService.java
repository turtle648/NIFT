package com.e101.nift.secondhand.service;

import com.e101.nift.secondhand.model.dto.response.DashBoardSummaryDto;
import com.e101.nift.secondhand.model.dto.response.PurchaseHistoryDto;
import com.e101.nift.secondhand.model.dto.response.SaleHistoryDto;
import com.e101.nift.secondhand.model.dto.response.ScrollDto;

import org.springframework.data.domain.Pageable;

public interface ArticleHistoryService {
    ScrollDto<PurchaseHistoryDto> getPurchaseHistories(Long userId, Pageable pageable);
    ScrollDto<SaleHistoryDto> getSalesHistories(Long sellerId, Pageable pageable);
    DashBoardSummaryDto getDashBoardSummary();
}
