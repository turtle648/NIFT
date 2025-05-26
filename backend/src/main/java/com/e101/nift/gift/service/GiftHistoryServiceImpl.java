package com.e101.nift.gift.service;

import com.e101.nift.common.exception.CustomException;
import com.e101.nift.common.exception.ErrorCode;
import com.e101.nift.common.util.ConvertUtil;
import com.e101.nift.gift.entity.CardDesign;
import com.e101.nift.gift.entity.GiftHistory;
import com.e101.nift.gift.model.dto.request.ReceivedGiftDto;
import com.e101.nift.gift.model.dto.request.SendGiftDto;
import com.e101.nift.gift.model.dto.response.GiftHistoryDto;
import com.e101.nift.gift.model.dto.response.SendGiftHistoryDto;
import com.e101.nift.gift.repository.CardDesignRepository;
import com.e101.nift.gift.repository.GiftHistoryRepository;
import com.e101.nift.gifticon.entity.Gifticon;
import com.e101.nift.gifticon.repository.GifticonRepository;
import com.e101.nift.secondhand.entity.Article;
import com.e101.nift.secondhand.exception.GiftHistoryErrorCode;
import com.e101.nift.secondhand.exception.GiftHistoryException;
import com.e101.nift.secondhand.model.contract.GifticonNFT;
import com.e101.nift.secondhand.model.dto.response.ScrollDto;
import com.e101.nift.secondhand.service.ContractService;
import com.e101.nift.secondhand.service.TransactionService;
import com.e101.nift.user.entity.User;
import com.e101.nift.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GiftHistoryServiceImpl implements GiftHistoryService {

    private final GiftHistoryRepository giftHistoryRepository;
    private final GifticonRepository gifticonRepository;
    private final UserRepository userRepository;
    private final ContractService contractService;
    private final TransactionService transactionService;
    private final CardDesignRepository cardDesignRepository;

    @Override
    public ScrollDto<SendGiftHistoryDto> getSendGiftHistories(Long senderId, Pageable pageable) {
        Page<GiftHistory> historiesPage = giftHistoryRepository.findByFromUserId_UserId(senderId, pageable);

        List<SendGiftHistoryDto> content = historiesPage.stream().map(history -> {
            Gifticon gifticon = gifticonRepository.findByGifticonId(history.getGifticon().getGifticonId())
                    .orElseThrow(() -> new RuntimeException("기프티콘 정보를 찾을 수 없습니다."));

            String toNickName = userRepository.findByUserId(history.getToUserId())
                    .map(User::getNickName)
                    .orElse("아직 가입하지 않은 회원입니다");

            return new SendGiftHistoryDto(
                    history.getGiftHistoryId(),
                    gifticon.getGifticonTitle(),
                    gifticon.getImageUrl(),
                    toNickName,
                    history.getCreatedAt()
            );
        }).toList();

        return new ScrollDto<>(content, historiesPage.hasNext());
    }

    @Override
    @Transactional
    public void sendGiftHistory(Long senderId, SendGiftDto request) {
        GifticonNFT.GiftPendingEventResponse giftPendingEventResponse = transactionService.getGiftPendingEventByTxHash(request.getTxHashGift()).getFirst();
        log.info("[GiftHistoryService] giftPendingEventResponse: {}", giftPendingEventResponse);

        User sender = userRepository.findByWalletAddress(giftPendingEventResponse.sender)
                .orElseThrow(() -> new GiftHistoryException(GiftHistoryErrorCode.CANNOT_FIND_BY_ADDRESS));
        log.info("[GiftHistoryService] senderId가 일치합니다: {}", sender.getUserId());

        User receiver = userRepository.findByKakaoId(request.getToUserKakaoId())
                .orElseThrow(() -> new GiftHistoryException(GiftHistoryErrorCode.CANNOT_FIND_BY_ADDRESS));
        log.info("[GiftHistoryService] receiverId가 일치합니다: {}", request.getToUserKakaoId());

        Gifticon gifticon = gifticonRepository.findByGifticonId(giftPendingEventResponse.tokenId.longValue())
                .orElseThrow(() -> new GiftHistoryException(GiftHistoryErrorCode.UNPROCESSABLE_TRANSACTION));
        log.info("[GiftHistoryService] 선물하고자 하는 gifticon이 존재합니다: {}", gifticon);

        if ("article".equals(request.getType())) {
            giftFromArticle(senderId, request, giftPendingEventResponse);
            log.info("[GiftHistoryService] 구매 완료");
        }

        // 선물 기록 저장
        GiftHistory giftHistory = GiftHistory.builder()
                .fromUserId(sender)
                .toUserId(receiver.getUserId())
                .toUserKakaoId(receiver.getKakaoId())
                .gifticon(gifticon)
                .mongoId(request.getMongoId())
                .isReceived(false)
                .serialNum(giftPendingEventResponse.serialNumber.longValue())
                .createdAt(ConvertUtil.convertTimestampToLocalTime(giftPendingEventResponse.transactionTime))
                .txHash(request.getTxHashGift())
                .build();
        giftHistoryRepository.save(giftHistory);
        log.info("[GiftHistoryService] giftHistory 저장 완료");
    }

    @Override
    public void receivedGiftHistory(Long receiverId, ReceivedGiftDto receivedGiftDto) {
        GifticonNFT.GiftedEventResponse giftedEventResponse = transactionService.getGiftedEventByTxHash(receivedGiftDto.getTxHash()).getFirst();
        log.info("[GiftHistoryService] giftedEventResponse: {}", giftedEventResponse);

        User receiver = userRepository.findByWalletAddress(giftedEventResponse.recipient)
                .orElseThrow(() -> new GiftHistoryException(GiftHistoryErrorCode.CANNOT_FIND_BY_ADDRESS));
        log.info("[GiftHistoryService] senderId가 일치합니다: {}", receiver.getUserId());

        if (!receiver.getUserId().equals(receiverId)) {
            throw new GiftHistoryException(GiftHistoryErrorCode.UNPROCESSABLE_TRANSACTION);
        }
        log.info("[GiftHistoryService] 로그인한 사용자와 sender가 일치합니다: {}", receiverId);

        GiftHistory giftHistory = giftHistoryRepository.findBySerialNum(giftedEventResponse.serialNumber.longValue())
                .orElseThrow(() -> new GiftHistoryException(GiftHistoryErrorCode.UNPROCESSABLE_TRANSACTION));
        log.info("[GiftHistoryService] 선물 받은 기록이 있습니다: {}", giftHistory);

        giftHistory.setReceived(true);
        giftHistoryRepository.save(giftHistory);
    }

    @Override
    public Page<GiftHistoryDto> getAcceptedGifts(Long userId, Pageable pageable) {
        Page<GiftHistory> gifts = giftHistoryRepository.findByToUserIdAndIsReceivedTrue(userId, pageable);

        // 1. MongoId 리스트 추출
        List<String> mongoIds = gifts.stream()
                .map(GiftHistory::getMongoId)
                .collect(Collectors.toList());

        // 2. CardDesign 한 번에 가져오기
        Map<String, CardDesign> cardDesignMap = cardDesignRepository.findAllById(mongoIds).stream()
                .collect(Collectors.toMap(CardDesign::getId, Function.identity()));

        // 3. DTO 매핑
        return gifts.map(gift -> {
            CardDesign design = cardDesignMap.get(gift.getMongoId());
            return GiftHistoryDto.from(gift, design);
        });
    }


    @Override
    public CardDesign findCardDesignBySerialNumber(Long serialNumber) {
        GiftHistory giftHistory = giftHistoryRepository.findBySerialNumAndIsReceivedFalse(serialNumber)
                .orElseThrow(() -> new EntityNotFoundException("GiftHistory not found for serialNum: " + serialNumber));

        CardDesign cardDesign = cardDesignRepository.findById(giftHistory.getMongoId())
                .orElseThrow(() -> new EntityNotFoundException("CardDesign not found for mongoId: " + giftHistory.getMongoId()));

        return cardDesign;
    }

    @Override
    public String getSenderNicknameBySerialNum(Long serialNum) {
        GiftHistory giftHistory = giftHistoryRepository.findBySerialNumAndIsReceivedFalse(serialNum)
                .orElseThrow(() -> new IllegalArgumentException("해당 serialNum의 선물 기록이 존재하지 않습니다."));
//        log.info("serialNum = {}", serialNum);
//        System.out.println("🪙🪙🪙확인: "+giftHistory.getGiftHistoryId());
        return giftHistory.getFromUserId().getNickName();
    }


    private void giftFromArticle(Long senderId, SendGiftDto request, GifticonNFT.GiftPendingEventResponse giftPendingEventResponse) {
        Article article = transactionService.getArticle(giftPendingEventResponse.serialNumber);

        contractService.addArticleHistory(article.getArticleId(), request.getTxHashPurchase(), senderId);
    }
}
