package com.e101.nift.gifticon.repository;

import com.e101.nift.gifticon.entity.Gifticon;
import com.e101.nift.gifticon.model.response.RecentGifticonDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GifticonRepository extends JpaRepository<Gifticon, Long>, JpaSpecificationExecutor<Gifticon> {
    Optional<Gifticon> findById(Long gifticonId);
    Optional<Gifticon> findByGifticonId(Long gifticonId);

    @Query("SELECT new com.e101.nift.gifticon.model.response.RecentGifticonDto(" +
            "g.gifticonId, b.brandName, c.categoryName, g.gifticonTitle, g.price, g.imageUrl) " +
            "FROM Gifticon g " +
            "JOIN g.brand b " +
            "JOIN g.category c " +
            "ORDER BY g.createdAt DESC")
    List<RecentGifticonDto> findRecentGifticons();
}
