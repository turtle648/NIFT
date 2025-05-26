package com.e101.nift.gifticon.model.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateGifticonDto {
    private String gifticonTitle;
    private String description;
    private Float price;
    private String imageUrl;
    private String metadataUrl;
    private Long brandId;
    private Long categoryId;
}