package com.e101.nift.secondhand.model.dto.response;

import com.e101.nift.secondhand.entity.Article;
import com.e101.nift.secondhand.model.state.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ArticleSellerDto {
    private Long articleId;
    private String title;
    private String imageUrl;
    private String brandName;
    private Float currentPrice;
    private SaleStatus state;

    public static ArticleSellerDto from(Article article) {
        return new ArticleSellerDto(
                article.getArticleId(),
                article.getTitle(),
                article.getImageUrl(),
                article.getGifticon().getBrand().getBrandName(),
                article.getCurrentPrice(),
                article.getState()
        );
    }
}
