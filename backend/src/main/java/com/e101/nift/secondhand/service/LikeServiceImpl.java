package com.e101.nift.secondhand.service;

import com.e101.nift.secondhand.entity.Like;
import com.e101.nift.secondhand.entity.Article;
import com.e101.nift.secondhand.model.dto.request.ArticleLikeDTO;
import com.e101.nift.secondhand.repository.LikeRepository;
import com.e101.nift.secondhand.repository.ArticleRepository;
import com.e101.nift.user.entity.User;
import com.e101.nift.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService{

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;

    @Transactional
    @Override
    public void addLike(Long userId, Long articleId){
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        Article article = articleRepository.findByArticleId(articleId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        Optional<Like> existingLike = likeRepository.findByUserAndArticle(user, article);
        if (existingLike.isPresent()){
            // 이미 좋아요가 존재하면 삭제 (좋아요 취소)
            likeRepository.delete(existingLike.get());
            article.setCountLikes(article.getCountLikes() - 1);
        } else {
            // 좋아요 추가
            Like like = new Like();
            like.setUser(user);
            like.setArticle(article);
            likeRepository.save(like);
            article.setCountLikes(article.getCountLikes() + 1);
        }
        articleRepository.save(article); // 좋아요 개수 업데이트
    }

    @Transactional
    @Override
    public void removeLike(Long userId, Long articleId) {

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        Article article = articleRepository.findByArticleId(articleId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        Optional<Like> existingLike = likeRepository.findByUserAndArticle(user, article);
        if (existingLike.isEmpty()) {
            throw new IllegalStateException("좋아요가 존재하지 않습니다.");
        }

        // 좋아요 삭제
        likeRepository.delete(existingLike.get());
        article.setCountLikes(article.getCountLikes() - 1);
        articleRepository.save(article); // 좋아요 개수 업데이트
    }

    @Override
    public Page<ArticleLikeDTO> getLikedArticles(Long userId, Pageable pageable) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        Page<Like> likes = likeRepository.findByUser(user, pageable);
        return likes.map(like -> new ArticleLikeDTO(
                like.getArticle().getArticleId(),
                like.getArticle().getTitle(),
                like.getArticle().getCountLikes(),
                like.getArticle().getImageUrl(),
                like.getArticle().getCurrentPrice(),
                like.getArticle().getState()
        ));
    }

    @Override
    public List<ArticleLikeDTO> getAllLikedArticles(Long userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        List<Like> likes = likeRepository.findByUser(user);

        return likes.stream()
                .map(like -> new ArticleLikeDTO(
                        like.getArticle().getArticleId(),
                        like.getArticle().getTitle(),
                        like.getArticle().getCountLikes(),
                        like.getArticle().getImageUrl(),
                        like.getArticle().getCurrentPrice(),
                        like.getArticle().getState()
                ))
                .toList();
    }
}
