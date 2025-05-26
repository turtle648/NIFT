package com.e101.nift.category.controller;

import com.e101.nift.brand.entity.Brand;
import com.e101.nift.brand.model.response.BrandDto;
import com.e101.nift.brand.repository.BrandRepository;
import com.e101.nift.category.entity.Category;
import com.e101.nift.category.model.CategoryDto;
import com.e101.nift.category.repository.CategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
public class CategoryAdminController {

    private final CategoryRepository categoryRepository;

    @Operation(summary = "카테고리 목록 추가", description = "카테고리 목록 추가하기")
    @PostMapping
    public ResponseEntity<CategoryDto> insertCategories(@RequestBody CategoryDto categoryDto) {
        Category category = new Category();
        category.setCategoryName(categoryDto.getCategoryName());

        categoryRepository.save(category);

        return ResponseEntity.ok().build();
    }

}
