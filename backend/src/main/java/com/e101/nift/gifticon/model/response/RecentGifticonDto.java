package com.e101.nift.gifticon.model.response;

public record RecentGifticonDto(
        Long gifticonId,
        String brandName,
        String categoryName,
        String gifticonTitle,
        Float price,
        String imageUrl
) {
}
