package com.e101.nift.used.service;

import com.e101.nift.common.exception.CustomException;
import com.e101.nift.common.exception.ErrorCode;
import com.e101.nift.common.util.ConvertUtil;
import com.e101.nift.gifticon.entity.Gifticon;
import com.e101.nift.gifticon.repository.GifticonRepository;
import com.e101.nift.secondhand.exception.ArticleErrorCode;
import com.e101.nift.secondhand.exception.ArticleException;
import com.e101.nift.secondhand.model.contract.GifticonNFT;
import com.e101.nift.secondhand.service.TransactionService;
import com.e101.nift.used.entity.UsedHistory;
import com.e101.nift.used.model.dto.response.UsedHistoryDto;
import com.e101.nift.used.repository.UsedHistoryRepository;
import com.e101.nift.user.entity.User;
import com.e101.nift.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsedHistoryServiceImpl implements UsedHistoryService {

    private final UsedHistoryRepository usedHistoryRepository;
    private final UserRepository userRepository;
    private final GifticonRepository gifticonRepository;
    private final TransactionService transactionService;

    @Override
    public Page<UsedHistoryDto> getUsedGifticons(Long userId, Pageable pageable) {
        User user = userRepository.findByUserId(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return usedHistoryRepository.findByUserId(user, pageable).map(history -> {
            Gifticon g = history.getGifticon();
            return UsedHistoryDto.builder()
                    .usedHistoryId(history.getUsedHistoryId())
                    .brandName(g.getBrand().getBrandName())
                    .title(g.getGifticonTitle())
                    .imageUrl(g.getImageUrl())
                    .usedAt(history.getCreatedAt())
                    .build();
        });
    }

    @Override
    public void insertUsedHistory(Long loginUser, String txHash) {
        GifticonNFT.RedeemedEventResponse redeemedEventResponse = transactionService.getRedeemedEventByTxHash(txHash).getFirst();
        LocalDateTime time = ConvertUtil.convertTimestampToLocalTime(redeemedEventResponse.transactionTime);
        log.debug("[ContractService] 트랜잭션 발생 시간: {}", time);
        log.debug("[ContractService] 트랜잭션 유저 지갑 주소: {}", redeemedEventResponse.owner);

        User user = userRepository.findByWalletAddress(redeemedEventResponse.owner).orElseThrow(() -> new ArticleException(ArticleErrorCode.CANNOT_FIND_BY_ADDRESS));

        if (!user.getUserId().equals(loginUser)) {
            log.info("[ContractService] 트랜잭션 유저 정보: {} {}", user, loginUser);
            throw new ArticleException(ArticleErrorCode.USER_MISMATCH);
        }

        Gifticon gifticon = gifticonRepository.findByGifticonId(redeemedEventResponse.tokenId.longValue()).orElseThrow(() -> new ArticleException(ArticleErrorCode.UNPROCESSABLE_TRANSACTION));

        usedHistoryRepository.save(
                UsedHistory.builder()
                        .txHash(txHash)
                        .serialNum(redeemedEventResponse.serialNumber.longValue())
                        .createdAt(time)
                        .userId(user)
                        .gifticon(gifticon)
                        .build()
        );
    }
}
