package com.e101.nift.gift.repository;

import com.e101.nift.gift.entity.GiftHistory;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;


public interface GiftHistoryRepository extends JpaRepository<GiftHistory, Long> {

    @EntityGraph(attributePaths = {"gifticon", "toUserId"})
    Page<GiftHistory> findByFromUserId_UserId(Long userId, Pageable pageable);

    Optional<GiftHistory> findGiftHistoriesByTxHash(String txHash);
    Optional<GiftHistory> findBySerialNum(Long serialNum);

    Optional<GiftHistory> findBySerialNumAndIsReceivedFalse(Long serialNum);

    Page<GiftHistory> findByToUserIdAndIsReceivedTrue(Long toUserId, Pageable pageable);
}