package com.e101.nift.secondhand.service;

import com.e101.nift.secondhand.entity.Article;
import com.e101.nift.secondhand.entity.ArticleHistory;
import com.e101.nift.secondhand.model.dto.response.DashBoardSummaryDto;
import com.e101.nift.secondhand.model.dto.response.PurchaseHistoryDto;
import com.e101.nift.secondhand.model.dto.response.SaleHistoryDto;
import com.e101.nift.secondhand.model.dto.response.ScrollDto;
import com.e101.nift.secondhand.model.state.ContractType;
import com.e101.nift.secondhand.model.state.SaleStatus;
import com.e101.nift.secondhand.repository.ArticleHistoryRepository;
import com.e101.nift.secondhand.repository.ArticleRepository;
import com.e101.nift.user.entity.User;
import com.e101.nift.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleHistoryServiceImpl implements ArticleHistoryService {


    private final ArticleHistoryRepository articleHistoryRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;


    @Override
    public ScrollDto<PurchaseHistoryDto> getPurchaseHistories(Long userId, Pageable pageable) {
        // 구매 + 선물 받은 내역 조회
        List<Short> historyTypes = List.of(
                ContractType.PURCHASE.getType(),
                ContractType.GIFT.getType()
        );

        Page<ArticleHistory> page = articleHistoryRepository
                .findByUserIdAndHistoryTypeIn(userId, historyTypes, pageable);

        List<PurchaseHistoryDto> responses = page.getContent().stream().map(history -> {
            Article article = articleRepository.findById(history.getArticleId())
                    .orElseThrow(() -> new RuntimeException("판매 목록을 조회할 수 없습니다."));

            User seller = userRepository.findByUserId(article.getUserId())
                    .orElseThrow(() -> new RuntimeException("조회되는 판매자가 없습니다."));

            return new PurchaseHistoryDto(
                    history.getArticleHistoryId(),
                    article.getTitle(),
                    article.getImageUrl(),
                    article.getCurrentPrice(),
                    seller.getNickName(),
                    history.getCreatedAt()
            );
        }).collect(Collectors.toList());

        return new ScrollDto<>(responses, page.hasNext());
    }

    @Override
    public ScrollDto<SaleHistoryDto> getSalesHistories(Long sellerId, Pageable pageable) {
        Page<Article> articlesPage = articleRepository.findByUserId(sellerId, pageable);

        List<SaleHistoryDto> content = articlesPage.stream().map(article -> {
            Optional<ArticleHistory> historyOpt = articleHistoryRepository.findByArticleId(article.getArticleId());

            if (historyOpt.isPresent()) {
                User buyer = userRepository.findById(historyOpt.get().getUserId())
                        .orElseThrow(() -> new RuntimeException("구매자 정보를 찾을 수 없습니다."));
                return new SaleHistoryDto(
                        article.getArticleId(),
                        article.getTitle(),
                        article.getImageUrl(),
                        article.getCurrentPrice(),
                        buyer.getNickName(),
                        historyOpt.get().getCreatedAt()
                );
            } else {
                return new SaleHistoryDto(
                        article.getArticleId(),
                        article.getTitle(),
                        article.getImageUrl(),
                        article.getCurrentPrice(),
                        null,
                        null
                );
            }
        }).toList();

        return new ScrollDto<>(content, articlesPage.hasNext());
    }

    @Override
    public DashBoardSummaryDto getDashBoardSummary() {
        LocalDate now = LocalDate.now(ZoneId.of("Asia/Seoul"));
        LocalDate startOfWeek = now.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = now.with(DayOfWeek.SUNDAY);

        long totalArticles = articleRepository.countByState(SaleStatus.ON_SALE);

        long weeklySalesCount = articleHistoryRepository.countByCreatedAtBetween(
                startOfWeek.atStartOfDay(), endOfWeek.atTime(LocalTime.MAX)
        );

        long weeklyRevenue = articleRepository.sumPriceByHistoryDateRange(
                startOfWeek.atStartOfDay(), endOfWeek.atTime(LocalTime.MAX));

        long totalUsers = userRepository.count();

        return new DashBoardSummaryDto(
                totalArticles, weeklySalesCount, weeklyRevenue, totalUsers
        );
    }
}
