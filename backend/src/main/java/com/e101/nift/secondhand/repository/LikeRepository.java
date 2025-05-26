package com.e101.nift.secondhand.repository;

import com.e101.nift.secondhand.entity.Like;
import com.e101.nift.secondhand.entity.Article;
import com.e101.nift.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByArticle_ArticleIdAndUser_UserId(Long articleId, Long userId);

    // 상품ID와 사용자ID로 좋아요 상품 조회
    Optional<Like> findByUserAndArticle(User user, Article article);

    // 사용자 ID, 페이지 번호로 좋아요 상품 전체 조회
    Page<Like> findByUser(User user, Pageable pageable);

    // 사용자 아이디로 좋아요 데이터 삭제
    void deleteByUser_UserId(Long userId);

    List<Like> findByUser(User user);
}
