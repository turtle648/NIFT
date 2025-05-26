package com.e101.nift.gifticon.service;

import com.e101.nift.brand.entity.Brand;
import com.e101.nift.brand.repository.BrandRepository;
import com.e101.nift.category.entity.Category;
import com.e101.nift.category.repository.CategoryRepository;
import com.e101.nift.gifticon.entity.Gifticon;
import com.e101.nift.gifticon.model.request.CreateGifticonDto;
import com.e101.nift.gifticon.model.request.GifticonSpecs;
import com.e101.nift.gifticon.model.request.UpdateGifticonDto;
import com.e101.nift.gifticon.model.response.GifticonDetailDto;
import com.e101.nift.gifticon.model.response.RecentGifticonDto;
import com.e101.nift.gifticon.repository.GifticonRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GifticonServiceImpl implements GifticonService {

    private final GifticonRepository gifticonRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public GifticonDetailDto getGifticonDetail(Long gifticonId) {
        Gifticon gifticon = gifticonRepository.findById(gifticonId)
                .orElseThrow(() -> new EntityNotFoundException("조회되는 기프티콘이 없습니다"));

        return new GifticonDetailDto(
                gifticon.getGifticonId(),
                gifticon.getGifticonTitle(),
                gifticon.getDescription(),
                gifticon.getImageUrl(),
                gifticon.getPrice(),
                gifticon.getBrand().getBrandName(),
                gifticon.getCategory().getCategoryName(),
                gifticon.getMetadataUrl(),
                gifticon.getCreatedAt()
                );
    }

    @Override
    public void createGifticon(CreateGifticonDto gifticonDto) {

        Gifticon gifticon = new Gifticon();

        gifticon.setGifticonId(gifticonDto.getGifticonId());
        gifticon.setGifticonTitle(gifticonDto.getGifticonTitle());
        gifticon.setDescription(gifticonDto.getDescription());
        gifticon.setImageUrl(gifticonDto.getImageUrl());
        gifticon.setMetadataUrl(gifticonDto.getMetadataUrl());
        gifticon.setPrice(gifticonDto.getPrice());
        gifticon.setGifticonTitle(gifticonDto.getGifticonTitle());
        gifticon.setBrand(brandRepository.findBrandByBrandId(gifticonDto.getBrandId()));
        gifticon.setCategory(categoryRepository.findCategoryByCategoryId(gifticonDto.getCategoryId()));
        gifticon.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        gifticonRepository.save(gifticon);
    }

    @Override
    public List<GifticonDetailDto> getAllGifticons() {
        List<Gifticon> gifticons = gifticonRepository.findAll();

        return gifticons.stream()
                .map(GifticonDetailDto::new) // 생성자에서 엔티티 -> DTO 변환
                .collect(Collectors.toList());
    }

    @Override
    public List<RecentGifticonDto> getRecentGifticons() {
        return gifticonRepository.findRecentGifticons();
    }

    @Override
    public void updateGifticon(Long id, UpdateGifticonDto dto) {
        Gifticon gifticon = gifticonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 기프티콘을 찾을 수 없습니다."));

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new RuntimeException("해당 브랜드를 찾을 수 없습니다."));
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("해당 카테고리를 찾을 수 없습니다."));

        gifticon.setGifticonTitle(dto.getGifticonTitle());
        gifticon.setDescription(dto.getDescription());
        gifticon.setPrice(dto.getPrice());
        gifticon.setImageUrl(dto.getImageUrl());
        gifticon.setMetadataUrl(dto.getMetadataUrl());
        gifticon.setBrand(brand);
        gifticon.setCategory(category);


        gifticonRepository.save(gifticon);
    }

    @Override
    public Page<GifticonDetailDto> searchGifticons(String term, Long categoryId, Long brandId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "gifticonId"));

        Specification<Gifticon> spec = Specification.where(null);

        if (StringUtils.hasText(term)) {
            spec = spec.and(GifticonSpecs.containsKeyword(term));
        }
        if (categoryId != null) {
            spec = spec.and(GifticonSpecs.hasCategory(categoryId));
        }
        if (brandId != null) {
            spec = spec.and(GifticonSpecs.hasBrand(brandId));
        }

        return gifticonRepository.findAll(spec, pageable)
                .map(GifticonDetailDto::fromEntity);
    }

}
