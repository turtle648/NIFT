package com.e101.nift.secondhand.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ArticleDetailDto {
    private Long articleId;
    private Long gifticonId;
    private Long serialNum;
    private String title;
    private String description;
    private Long userId;
    private LocalDateTime expirationDate;
    private String imageUrl;
    private Integer countLikes;
    private Float currentPrice;
    private LocalDateTime createAt;
    private Integer viewCnt;

    private Float originalPrice;
    private String brandName;
    private String categoryName;
    private boolean liked;

    private String userNickName;
    private String profileImage;
    private Long sellerTxs; // 판매자가 참여한 거래수
    private boolean isPossible; // 판매자와 조회자의 일치 여부 - 본인이 올린 글이면 false
    private boolean isSold; // 판매 완료 체크
}
