package com.e101.nift.gifticon.model.response;

import com.e101.nift.gifticon.entity.Gifticon;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class GifticonDetailDto {
    private Long gifticonId;
    private String gifticonTitle;
    private String description;
    private String imageUrl;
    private Float price;
    private String brandName;
    private String categoryName;
    private String metadataUrl;
    private Timestamp createdAt;


    public GifticonDetailDto(Gifticon gifticon) {
        this.gifticonId = gifticon.getGifticonId();
        this.gifticonTitle = gifticon.getGifticonTitle();
        this.description = gifticon.getDescription();
        this.price = gifticon.getPrice();
        this.imageUrl = gifticon.getImageUrl();
        this.brandName = gifticon.getBrand().getBrandName();
        this.categoryName = gifticon.getCategory().getCategoryName();
        this.metadataUrl = gifticon.getMetadataUrl();
        this.createdAt = gifticon.getCreatedAt();
    }

    public static GifticonDetailDto fromEntity(Gifticon gifticon) {
        return new GifticonDetailDto(gifticon);
    }

}
