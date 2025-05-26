package com.e101.nift.gifticon.controller;

import com.e101.nift.gifticon.model.request.CreateGifticonDto;
import com.e101.nift.gifticon.model.request.UpdateGifticonDto;
import com.e101.nift.gifticon.service.GifticonService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/gifticons")
@RequiredArgsConstructor
public class GifticonAdminController {

    private final GifticonService gifticonService;

    @Operation(summary = "기프티콘 정보 추가", description = "기프티콘(NFT)에 대한 정보를 DB에 입력")
    @PostMapping
    public ResponseEntity<CreateGifticonDto> createGifticon(@RequestBody CreateGifticonDto gifticonDto){

        gifticonService.createGifticon(gifticonDto);

        return ResponseEntity.ok(gifticonDto);
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
}

