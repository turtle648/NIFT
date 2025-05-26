package com.e101.nift.secondhand.service;


import com.e101.nift.secondhand.model.dto.request.ArticleLikeDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LikeService {
    void addLike(Long userId, Long ArticleId);
    void removeLike(Long userId, Long ArticleId);
    Page<ArticleLikeDTO> getLikedArticles(Long userId, Pageable pageable);
    List<ArticleLikeDTO> getAllLikedArticles(Long userId);
}
