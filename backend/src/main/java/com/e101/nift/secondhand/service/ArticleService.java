package com.e101.nift.secondhand.service;


import com.e101.nift.secondhand.model.dto.request.PostArticleDto;
import com.e101.nift.secondhand.model.dto.request.TxHashDTO;
import com.e101.nift.secondhand.model.dto.response.ArticleDetailDto;
import com.e101.nift.secondhand.model.dto.response.ArticleListDto;
import com.e101.nift.secondhand.model.dto.response.ArticleSellerDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ArticleService {
    Page<ArticleListDto> getArticleList(String sort, List<Long> categories, Pageable pageable, Long userId, Float minPrice, Float maxPrice);
    void createArticle(PostArticleDto postArticleDto, Long userId);

    ArticleDetailDto getArticleDetail(Long id, Long userId, Long accessUserId);

    void deleteArticle(Long articleId, TxHashDTO txHashDTO);

    Float getMaxCurrentPrice();

    Page<ArticleSellerDto> getOtherArticlesByUser(Long userId, int page, int size);
}
