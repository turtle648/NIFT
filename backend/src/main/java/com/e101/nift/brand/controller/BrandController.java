package com.e101.nift.brand.controller;

import com.e101.nift.brand.entity.Brand;
import com.e101.nift.brand.model.response.BrandDto;
import com.e101.nift.brand.repository.BrandRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;

    @Operation(summary = "브랜드 목록 가져오기", description = "브랜드 목록 가져오기")
    @GetMapping
    public ResponseEntity<List<BrandDto>> getAllCategories() {
        List<Brand> brands = brandRepository.findAll();

        List<BrandDto> result = brands.stream()
                .map(c -> new BrandDto(c.getBrandId(), c.getBrandName()))
                .toList();

        return ResponseEntity.ok(result);
    }
}
