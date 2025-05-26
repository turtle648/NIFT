package com.e101.nift.gift.model.dto.response;

import com.e101.nift.gift.entity.CardDesign;
import com.e101.nift.gift.entity.GiftHistory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class GiftHistoryDto {
    private Long giftHistoryId;
    private LocalDateTime createdAt;
    private String senderNickname;
    private CardDesign cardDesign;
    private String imageUrl;
    private String title;

    public static GiftHistoryDto from(GiftHistory gift, CardDesign design) {
        return GiftHistoryDto.builder()
                .giftHistoryId(gift.getGiftHistoryId())
                .createdAt(gift.getCreatedAt())
                .senderNickname(gift.getFromUserId().getNickName()) // 필요에 따라 수정
                .cardDesign(design)
                .imageUrl(gift.getGifticon().getImageUrl())
                .title(gift.getGifticon().getGifticonTitle())
                .build();
    }

}