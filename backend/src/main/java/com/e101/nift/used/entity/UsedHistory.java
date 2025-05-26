package com.e101.nift.used.entity;

import com.e101.nift.gifticon.entity.Gifticon;
import com.e101.nift.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "used_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class UsedHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long usedHistoryId;
    private String txHash;
    private Long serialNum;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User userId;
    
    @ManyToOne
    @JoinColumn(name = "gifticon_id", nullable = false)
    private Gifticon gifticon;
}