package com.e101.nift.gift.controller;


import com.e101.nift.common.security.CustomUserDetails;
import com.e101.nift.common.security.JwtTokenProvider;
import com.e101.nift.gift.entity.CardDesign;
import com.e101.nift.gift.model.dto.request.ReceivedGiftDto;
import com.e101.nift.gift.model.dto.request.SendGiftDto;
import com.e101.nift.gift.model.dto.response.GiftHistoryDto;
import com.e101.nift.gift.service.GiftHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gift-histories")
@RequiredArgsConstructor
@Tag(name = "Gift-histories", description = "선물 관련 API")
public class GiftController {

    private final GiftHistoryService giftHistoryService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/send")
    public ResponseEntity<Void> sendGift(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody SendGiftDto request
    ) {
        // 선물 보내는 사람
        Long sender = userDetails.getUserId();
        giftHistoryService.sendGiftHistory(sender, request);
//        System.out.println("✅ 선물 보내기 완료!");

        return ResponseEntity.ok().build();
    }

    @PostMapping("/received")
    public ResponseEntity<Void> receivedGift(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ReceivedGiftDto receivedGiftDto
    ) {
        Long receiver = userDetails.getUserId();

        giftHistoryService.receivedGiftHistory(receiver, receivedGiftDto);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/received")
    @Operation(summary = "받은 선물 조회", description = "받은 선물 카드 포함")
    public ResponseEntity<Page<GiftHistoryDto>> getReceivedGifts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        Long userId = userDetails.getUserId(); // 카카오 ID 기반
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<GiftHistoryDto> result = giftHistoryService.getAcceptedGifts(userId, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/card-design")
    @Operation(summary = "카드 디자인 조회", description = "serialNumber로 카드 디자인 조회")
    public ResponseEntity<CardDesign> getCardDesignBySerialNum(@RequestParam Long serialNum) {
        CardDesign cardDesign = giftHistoryService.findCardDesignBySerialNumber(serialNum);
        return ResponseEntity.ok(cardDesign);
    }

    @GetMapping("/sender")
    @Operation(summary = "선물 보낸 사람 조회", description = "serialNumber로 송신자 닉네임 조회")
    public ResponseEntity<String> getSenderBySerialNum(@RequestParam Long serialNum) {
        String userNickname = giftHistoryService.getSenderNicknameBySerialNum(serialNum);
        return ResponseEntity.ok(userNickname);

    }

}
