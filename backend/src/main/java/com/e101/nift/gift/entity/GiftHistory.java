package com.e101.nift.gift.entity;

import com.e101.nift.gifticon.entity.Gifticon;
import com.e101.nift.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "gift_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiftHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long giftHistoryId;

    private LocalDateTime createdAt;
    private String mongoId;
    private Long serialNum;
    private String txHash;

    @ManyToOne
    @JoinColumn(name = "from_user_id", nullable = false)
    private User fromUserId;

    @Column(name = "to_user_id", nullable = true)
    private Long toUserId;

    @Column(name = "to_user_kakao_id", nullable = false)
    private Long toUserKakaoId;

    @ManyToOne
    @JoinColumn(name = "gifticon_id", nullable = false)
    private Gifticon gifticon;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean isReceived = false;
}
