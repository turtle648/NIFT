package com.e101.nift.gifticon.service;

import com.e101.nift.gifticon.model.request.CreateGifticonDto;
import com.e101.nift.gifticon.model.request.UpdateGifticonDto;
import com.e101.nift.gifticon.model.response.GifticonDetailDto;
import com.e101.nift.gifticon.model.response.RecentGifticonDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface GifticonService {
    GifticonDetailDto getGifticonDetail(Long gifticonId);
    void createGifticon(CreateGifticonDto gifticonDto);
    List<GifticonDetailDto> getAllGifticons();
    List<RecentGifticonDto> getRecentGifticons();
    void updateGifticon(Long id, UpdateGifticonDto dto);
    Page<GifticonDetailDto> searchGifticons(String term, Long categoryId, Long brandId, int page, int size);
}
