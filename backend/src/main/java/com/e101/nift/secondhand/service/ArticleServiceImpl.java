package com.e101.nift.secondhand.service;

import com.e101.nift.common.util.ConvertUtil;
import com.e101.nift.gifticon.entity.Gifticon;
import com.e101.nift.secondhand.entity.Article;
import com.e101.nift.secondhand.exception.ArticleErrorCode;
import com.e101.nift.secondhand.exception.ArticleException;
import com.e101.nift.secondhand.model.contract.GifticonNFT;
import com.e101.nift.secondhand.model.dto.request.PostArticleDto;
import com.e101.nift.secondhand.model.dto.request.TxHashDTO;
import com.e101.nift.secondhand.model.dto.response.ArticleDetailDto;
import com.e101.nift.secondhand.model.dto.response.ArticleListDto;
import com.e101.nift.secondhand.model.dto.response.ArticleSellerDto;
import com.e101.nift.secondhand.model.state.SaleStatus;
import com.e101.nift.secondhand.repository.ArticleRepository;
import com.e101.nift.secondhand.repository.LikeRepository;
import com.e101.nift.user.entity.User;
import com.e101.nift.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {
    private final ArticleRepository articleRepository;
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final TransactionService transactionService;

    @Override
    @Transactional(readOnly = true)
    public Page<ArticleListDto> getArticleList(String sort, List<Long> categories, Pageable pageable, Long userId, Float minPrice, Float maxPrice) {
        // 정렬 기준
        Sort sortBy = switch (sort) {
            case "highest" -> Sort.by(Sort.Direction.DESC, "currentPrice").and(Sort.by("articleId"));
            case "lowest" -> Sort.by(Sort.Direction.ASC, "currentPrice").and(Sort.by("articleId"));
            case "likes" -> Sort.by(Sort.Direction.DESC, "countLikes").and(Sort.by("articleId"));
            case "views" -> Sort.by(Sort.Direction.DESC, "viewCnt").and(Sort.by("articleId"));
            default -> Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by("articleId"));
        };

        // 판매 중인 상태만 조회 가능하게
        SaleStatus targetState = SaleStatus.ON_SALE;

        // 정렬이 적용된 Pageable 생성
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sortBy);

        Page<ArticleListDto> articles;

        // 필터
        if (categories != null && !categories.isEmpty()) {
            // 카테고리 필터가 적용된 경우
            if (minPrice != null || maxPrice != null) {
                // 카테고리 + 가격 조건 모두 적용
                articles = articleRepository.findByCategoryAndPriceRange(categories, minPrice, maxPrice, targetState, sortedPageable)
                        .map(article -> {
                            boolean isLiked = (userId != null) &&
                                    likeRepository.existsByArticle_ArticleIdAndUser_UserId(article.getArticleId(), userId);
                            return ArticleListDto.from(article, isLiked);
                        });
            } else {
                // 카테고리만 적용
                articles = articleRepository.findByCategoryIds(categories, targetState, sortedPageable)
                        .map(article -> {
                            boolean isLiked = (userId != null) &&
                                    likeRepository.existsByArticle_ArticleIdAndUser_UserId(article.getArticleId(), userId);
                            return ArticleListDto.from(article, isLiked);
                        });
            }
        } else {
            // 카테고리 필터가 없는 경우
            if (minPrice != null || maxPrice != null) {
                // 가격 조건만 적용
                articles = articleRepository.findByPriceRange(minPrice, maxPrice, targetState, sortedPageable)
                        .map(article -> {
                            boolean isLiked = (userId != null) &&
                                    likeRepository.existsByArticle_ArticleIdAndUser_UserId(article.getArticleId(), userId);
                            return ArticleListDto.from(article, isLiked);
                        });
            } else {
                // 아무 필터도 없는 경우 전체 조회 (ON_SALE 상태만 필터링)
                articles = articleRepository.findByState(targetState, sortedPageable)
                        .map(article -> {
                            boolean isLiked = (userId != null) &&
                                    likeRepository.existsByArticle_ArticleIdAndUser_UserId(article.getArticleId(), userId);
                            return ArticleListDto.from(article, isLiked);
                        });
            }
        }

        log.info("[ArticleService] getArticleList {}", articles);
        return articles;
    }

    // 가격 필터링 최대 가격
    @Override
    @Transactional(readOnly = true)
    public Float getMaxCurrentPrice() {
        Float maxPrice = articleRepository.findMaxCurrentPrice();
        return maxPrice != null ? maxPrice : 0f;
    }

    @Override
    public Page<ArticleSellerDto> getOtherArticlesByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Article> articles = articleRepository.findByUserIdAndState(userId, SaleStatus.ON_SALE, pageable);

        return articles.map(ArticleSellerDto::from);
    }

    // 로그인 여부와 관계없이 전체 상품 반환
    // userId == null 이면 isLiked=false로 설정
    private ArticleListDto mapArticleToDto(Article article, Long userId) {
        boolean isLiked = (userId != null) && likeRepository.existsByArticle_ArticleIdAndUser_UserId(article.getArticleId(), userId);
        log.info("상품 ID: {}, userId: {}, isLiked: {}", article.getArticleId(), userId, isLiked);

        return ArticleListDto.from(article, isLiked);
    }

    // 중고 기프티콘의 상세 정보 조회
    @Override
    public ArticleDetailDto getArticleDetail(Long articleId, Long userId, Long accessUserId) {

        Article article = articleRepository.findByArticleId(articleId)
                .orElseThrow(() -> new RuntimeException("상품이 조회되지 않습니다."));

        Gifticon gifticon = article.getGifticon();

        article.setViewCnt(article.getViewCnt()+1);
        articleRepository.save(article);

        boolean isLiked = false;
        if (userId != null) {
            isLiked = likeRepository.existsByArticle_ArticleIdAndUser_UserId(articleId, userId);
        }

        User user = userRepository.findByUserId(article.getUserId())
                .orElseThrow(() -> new RuntimeException("판매자 정보가 조회되지 않습니다."));
        Long sellerTxs = articleRepository.countByUserId(article.getUserId());

        boolean isPossible = true;
//        System.out.println("🍰🍰🍰접속한 사용자 : "+ accessUserId+ ", 판매자 : "+ article.getUserId());
        if (accessUserId != null) {
            isPossible = (!accessUserId.equals(article.getUserId()));
        }

        boolean isSold = false;
        isSold = article.getState() == SaleStatus.SOLD;

        return new ArticleDetailDto(
                article.getArticleId(),
                article.getGifticon().getGifticonId(),
                article.getSerialNum(),
                article.getTitle(),
                article.getDescription(),
                article.getUserId(),
                article.getExpirationDate(),
                article.getImageUrl(),
                article.getCountLikes(),
                article.getCurrentPrice(),
                article.getCreatedAt(),
                article.getViewCnt(),
                gifticon.getPrice(),
                gifticon.getBrand().getBrandName(),
                gifticon.getCategory().getCategoryName(),
                isLiked,
                user.getNickName(),
                user.getProfileImage(),
                sellerTxs,
                isPossible,
                isSold
        );
    }

    @Override
    public void createArticle(PostArticleDto postArticleDto, Long loginUser) {
        GifticonNFT.ListedForSaleEventResponse listedForSaleEventResponse = transactionService.getListedForSaleEventByTxHash(postArticleDto.getTxHash()).getFirst();

        log.info("[ArticleService] listedForSaleEventResponse: {}", listedForSaleEventResponse);

        Gifticon gifticon = transactionService.getGifticon(listedForSaleEventResponse.tokenId);

        Long userId = transactionService.getUserId(listedForSaleEventResponse.seller);

        if(!userId.equals(loginUser)) {
            log.info("[ArticleService] 트랜잭션 유저 정보: {} {}", userId, loginUser);
            throw new ArticleException(ArticleErrorCode.USER_MISMATCH);
        }

        articleRepository.save(
                Article.builder()
                        .title(postArticleDto.getTitle())
                        .description(postArticleDto.getDescription())
                        .userId(userId)
                        .countLikes(0)
                        .createdAt(ConvertUtil.convertTimestampToLocalTime(listedForSaleEventResponse.transactionTime))
                        .viewCnt(0)
                        .imageUrl(ConvertUtil.convertIpfsUrl(listedForSaleEventResponse.metadataURI))
                        .gifticon(gifticon)
                        .serialNum(listedForSaleEventResponse.serialNumber.longValue())
                        .expirationDate(ConvertUtil.convertTimestampToLocalTime(listedForSaleEventResponse.expirationDate))
                        .currentPrice(listedForSaleEventResponse.price.floatValue())
                        .txHash(postArticleDto.getTxHash())
                        .state(SaleStatus.ON_SALE)
                        .build()
        );
    }

    @Override
    public void deleteArticle(Long articleId, TxHashDTO hashDTO) {
        GifticonNFT.CancelledSaleEventResponse cancelledSaleEventResponse = transactionService.getCancelledSaleEventByTxHash(hashDTO.getTxHash()).getFirst();
        log.info("[ArticleService] cancelledSaleEventResponse: {}", cancelledSaleEventResponse);

        // TODO: 사용자 ID 와 transaction 주소 동일한지 비교로직 필요 (ABI 변경됨)

        Article article = transactionService.getArticle(cancelledSaleEventResponse.serialNumber);

        if(!articleId.equals(article.getArticleId())) {
            log.warn("[ArticleService] 게시글 정보가 다릅니다: {}", article);
            throw new ArticleException(ArticleErrorCode.ARTICLE_NOT_FOUND);
        }

        article.setState(SaleStatus.DELETED);
        articleRepository.save(article);
    }
}