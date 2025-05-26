package com.e101.nift.gifticon.controller;

import com.e101.nift.gifticon.model.request.CreateGifticonDto;
import com.e101.nift.gifticon.model.request.UpdateGifticonDto;
import com.e101.nift.gifticon.model.response.GifticonDetailDto;
import com.e101.nift.gifticon.model.response.RecentGifticonDto;
import com.e101.nift.gifticon.service.GifticonService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/gifticons")
@RequiredArgsConstructor
public class GifticonController {

    private final GifticonService gifticonService;

    @GetMapping("/{id}")
    public ResponseEntity<GifticonDetailDto> getGifticonById(@PathVariable("id") Long id){
        GifticonDetailDto dto = gifticonService.getGifticonDetail(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<GifticonDetailDto>> getAllGifticons(){

        List<GifticonDetailDto> list = gifticonService.getAllGifticons();
        return ResponseEntity.ok(list);

    }

    @GetMapping("/recent")
    @Operation(summary = "최근 등록된 4개 기프티콘 조회", description = "관리자 페이지에서 조회되는 최신 기프티콘 조회")
    public ResponseEntity<List<RecentGifticonDto>> getRecentGifticons() {
        return ResponseEntity.ok(gifticonService.getRecentGifticons());
    }

    @PatchMapping("/{id}")
    @Operation(summary = "기프티콘 정보 수정", description = "기프티콘 정보 수정")
    public ResponseEntity<Void> updateGifticon(
            @PathVariable("id") Long id,
            @RequestBody UpdateGifticonDto updateDto
    ) {
        gifticonService.updateGifticon(id, updateDto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    @Operation(summary = "기프티콘 검색 및 페이지네이션", description = "검색어 및 필터, 페이지 정보를 기반으로 기프티콘 목록 조회")
    public ResponseEntity<Page<GifticonDetailDto>> searchGifticons(
            @RequestParam(value = "term", required = false) String term,
            @RequestParam(value = "category", required = false) Long categoryId,
            @RequestParam(value = "brand", required = false) Long brandId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<GifticonDetailDto> result = gifticonService.searchGifticons(term, categoryId, brandId, page, size);
        return ResponseEntity.ok(result);
    }
}
