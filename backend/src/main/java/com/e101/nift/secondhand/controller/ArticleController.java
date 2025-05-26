package com.e101.nift.secondhand.controller;

import com.e101.nift.common.security.CustomUserDetails;
import com.e101.nift.common.security.JwtTokenProvider;
import com.e101.nift.secondhand.model.dto.request.PostArticleDto;
import com.e101.nift.secondhand.model.dto.request.TxHashDTO;
import com.e101.nift.secondhand.model.dto.response.ArticleDetailDto;
import com.e101.nift.secondhand.model.dto.response.ArticleListDto;
import com.e101.nift.secondhand.model.dto.response.ArticleSellerDto;
import com.e101.nift.secondhand.service.ArticleService;
import com.e101.nift.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/secondhand-articles")
public class ArticleController {
    private static final Logger log = LoggerFactory.getLogger(ArticleController.class);
    private final ArticleService articleService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    @Operation(summary = "판매 게시글 조회", description = "기프티콘을 판매하는 게시글을 조회합니다.")
    public ResponseEntity<Page<ArticleListDto>> getArticles(
            @RequestParam(name = "sort", defaultValue = "newest") String sort,  // 정렬 기준
            @RequestParam(name = "category", required = false) List<Long> categories,  // 카테고리 필터링
            @RequestParam(name = "page", defaultValue = "1") int page,  // 기본 페이지 번호
            @RequestParam(name = "size", defaultValue = "10") int size,  // 페이지 크기
            @RequestParam(name = "min-price", required = false) Float minPrice,    // 최소 가격
            @RequestParam(name = "max-price", required = false) Float maxPrice,     // 최대 가격
            HttpServletRequest request
    ) {
        log.info("[ArticleController] 진입 {} {} {} {} {} {}", sort, categories, page, size, maxPrice, minPrice);
        Long userId = null;

        try {
            User user = jwtTokenProvider.getUserFromRequest(request);
            userId = user.getUserId();
        } catch (UsernameNotFoundException e) {
            log.warn("유효하지 않은 토큰입니다: {}", e.getMessage());
        }

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<ArticleListDto> articles = articleService.getArticleList(sort, categories, pageable, userId, minPrice, maxPrice);
        return ResponseEntity.ok(articles);
    }

    @GetMapping("/max-price")
    @Operation(summary = "최대 가격 조회", description = "판매 중인 중고 상품 중 가장 비싼 currentPrice를 반환합니다.")
    public ResponseEntity<?> getMaxPrice() {
        Float maxPrice = articleService.getMaxCurrentPrice();
        return ResponseEntity.ok().body(Map.of("maxPrice", maxPrice));
    }

    @GetMapping("/{articleId}")
    @Operation(summary = "판매 게시글 상세조회", description = "판매중인 상품의 상세 정보를 조회합니다.")
    public ResponseEntity<ArticleDetailDto> getArticleById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("articleId") Long articleId,
            HttpServletRequest request
    ) {

        Long accessUserId = null;
        try {
            accessUserId = jwtTokenProvider.getUserFromRequest(request).getUserId();
        } catch (UsernameNotFoundException e) {
            log.warn("유효하지 않은 사용자 입니다: {}", e.getMessage());
        }

        Long userId = (userDetails != null) ? userDetails.getUserId() : null;
        ArticleDetailDto dto = articleService.getArticleDetail(articleId, userId, accessUserId);
        return ResponseEntity.ok(dto);
    }


    @PostMapping
    @Operation(summary = "게시글 쓰기", description = "기프티콘 판매 게시글을 작성합니다.")
    public ResponseEntity<?> PostArticles(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PostArticleDto postArticleDto
    ) {
        articleService.createArticle(postArticleDto, userDetails.getUserId());
        return ResponseEntity.status(201).build();
    }


    @DeleteMapping("/{articleId}")
    @Operation(summary = "게시글 삭제", description = "기프티콘 판매 게시글을 삭제합니다.")
    public ResponseEntity<?> deleteArticles(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("articleId") Long articleId,
            @RequestBody TxHashDTO txHashDTO
    ) {
        articleService.deleteArticle(articleId, txHashDTO);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/others")
    @Operation(summary = "판매자의 다른 상품", description = "판매자가 판매중인 다른 상품을 조회합니다.")
    public Page<ArticleSellerDto> getOtherArticlesByUser(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ){
        return articleService.getOtherArticlesByUser(userId, page, size);
    }

}
