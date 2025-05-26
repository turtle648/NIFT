package com.e101.nift.secondhand.controller;

import com.e101.nift.common.security.JwtTokenProvider;
import com.e101.nift.secondhand.model.dto.response.DashBoardSummaryDto;
import com.e101.nift.secondhand.model.dto.response.PurchaseHistoryDto;
import com.e101.nift.secondhand.model.dto.response.SaleHistoryDto;
import com.e101.nift.secondhand.model.dto.response.ScrollDto;
import com.e101.nift.gift.model.dto.response.SendGiftHistoryDto;
import com.e101.nift.secondhand.service.ArticleHistoryService;
import com.e101.nift.gift.service.GiftHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/secondhand-articles/histories")
public class ArticleHistoryController {

    private final JwtTokenProvider jwtTokenProvider;
    private final ArticleHistoryService articleHistoryService;
    private final GiftHistoryService giftHistoryService;

    @GetMapping("/purchase")
    @Operation(summary = "구매 내역 조회", description = "로그인한 사용자의 구매 내역을 최신순으로 조회, ")
    public ResponseEntity<ScrollDto<PurchaseHistoryDto>> getMyPurchaseHistory(
            HttpServletRequest request,
            @PageableDefault(size=5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = jwtTokenProvider.getUserFromRequest(request).getUserId();

        ScrollDto<PurchaseHistoryDto> response = articleHistoryService.getPurchaseHistories(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sale")
    @Operation(summary = "판매 내역 조회", description = "로그인한 사용자의 판매 내역을 최신 순으로 조회")
    public ResponseEntity<ScrollDto<SaleHistoryDto>> getMySaleHistory(
            HttpServletRequest request,
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = jwtTokenProvider.getUserFromRequest(request).getUserId();
        ScrollDto<SaleHistoryDto> response = articleHistoryService.getSalesHistories(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/send-gift")
    @Operation(summary = "보낸 선물 조회", description = "로그인한 사용자의 보낸 선물 내역을 최신 순으로 조회")
    public ResponseEntity<ScrollDto<SendGiftHistoryDto>> getMySendGiftHistory(
            HttpServletRequest request,
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ){
        Long userId = jwtTokenProvider.getUserFromRequest(request).getUserId();
        ScrollDto<SendGiftHistoryDto> response = giftHistoryService.getSendGiftHistories(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard-summary")
    @Operation(summary = "대시보드 데이터", description = "관리자 페이지의 대시보드에서 조회되는 데이터입니다.")
    public ResponseEntity<DashBoardSummaryDto> getDashboardSummary() {
        DashBoardSummaryDto response = articleHistoryService.getDashBoardSummary();
        return ResponseEntity.ok(response);
    }

}
