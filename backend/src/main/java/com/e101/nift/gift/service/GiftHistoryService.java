package com.e101.nift.gift.service;

import com.e101.nift.gift.entity.CardDesign;
import com.e101.nift.gift.model.dto.request.ReceivedGiftDto;
import com.e101.nift.gift.model.dto.request.SendGiftDto;
import com.e101.nift.gift.model.dto.response.GiftHistoryDto;
import com.e101.nift.gift.model.dto.response.SendGiftHistoryDto;
import com.e101.nift.secondhand.model.dto.response.ScrollDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface GiftHistoryService {
    ScrollDto<SendGiftHistoryDto> getSendGiftHistories(Long userId, Pageable pageable);

    // 프론트에서 요청 받는 선물 기록 저장
    void sendGiftHistory(Long sender, SendGiftDto request);

    void receivedGiftHistory(Long receiver, ReceivedGiftDto receivedGiftDto);
    Page<GiftHistoryDto> getAcceptedGifts(Long toUserId, Pageable pageable);
    CardDesign findCardDesignBySerialNumber(Long serialNumber);
    String getSenderNicknameBySerialNum(Long serialNum);
}
