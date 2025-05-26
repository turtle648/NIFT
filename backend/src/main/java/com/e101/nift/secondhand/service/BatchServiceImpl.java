package com.e101.nift.secondhand.service;

import com.e101.nift.common.util.ConvertUtil;
import com.e101.nift.gift.entity.GiftHistory;
import com.e101.nift.gift.repository.GiftHistoryRepository;
import com.e101.nift.secondhand.entity.Article;
import com.e101.nift.secondhand.entity.SyncStatus;
import com.e101.nift.secondhand.exception.ArticleErrorCode;
import com.e101.nift.secondhand.exception.ArticleException;
import com.e101.nift.secondhand.model.contract.GifticonNFT;
import com.e101.nift.secondhand.model.state.SaleStatus;
import com.e101.nift.secondhand.model.state.SyncType;
import com.e101.nift.secondhand.repository.ArticleHistoryRepository;
import com.e101.nift.secondhand.repository.ArticleRepository;
import com.e101.nift.secondhand.repository.SyncStatusRepository;
import com.e101.nift.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {
    private final TransactionService transactionService;
    private final ArticleHistoryRepository articleHistoryRepository;
    private final ArticleRepository articleRepository;
    private final GiftHistoryRepository giftHistoryRepository;
    private final ContractService contractService;
    private final SyncStatusRepository syncStatusRepository;

    @Scheduled(fixedDelay = 100000)
    public void realTimeSync() {
        log.info("[BatchService] 실시간 동기화 진행: {}", LocalDateTime.now());

        SyncStatus syncStatus = syncStatusRepository.findSyncStatusBySyncType(SyncType.REAL_TIME)
                .orElseGet(() -> {
                    SyncStatus newSyncStatus = new SyncStatus();
                    newSyncStatus.setSyncType(SyncType.REAL_TIME);
                    BigInteger latestBlock = transactionService.getLatestBlockNumber();
                    newSyncStatus.setLastSyncedBlock(latestBlock.longValue() - 10);
                    return syncStatusRepository.save(newSyncStatus);
                });

        BigInteger startBlock = BigInteger.valueOf(syncStatus.getLastSyncedBlock()).add(BigInteger.ONE);
        List<BigInteger> blockNumbers = transactionService.getBlockNumbersFrom(startBlock);

        log.info("최근 10개 블록: {}", blockNumbers);

        for (BigInteger block : blockNumbers) {
            try {
                handlePurchaseEvent(block);
                handleListForSaleEvent(block);
                handleGiftPendingEvent(block);
                handleGiftedEvent(block);
                syncStatusRepository.updateByLastSyncedBlock(block.longValue(), LocalDateTime.now(), SyncType.REAL_TIME);
            } catch (Exception e) {
                log.error("블록 처리 실패: {}", block, e);
                // TODO: 실패 블록 기록 필요
            }
        }
    }

    private void handleGiftedEvent(BigInteger block) {
        List<GifticonNFT.GiftedEventResponse> giftPendingEventResponseList = transactionService.getGiftedEventByBlockNumber(block);

        giftPendingEventResponseList.parallelStream().forEach(response -> {
            log.info("[BatchService] response: {}", response);
            if (response == null) return;

            try {
                Optional<GiftHistory> optionalGiftHistory = giftHistoryRepository.findGiftHistoriesByTxHash(response.log.getTransactionHash());

                if (optionalGiftHistory.isEmpty()) {
                    log.error("[BatchService] Gifted에 대해 GiftHistory가 존재하지 않습니다 : {}", response.log.getTransactionHash());
                    return;
                }

                User receiver = transactionService.getUser(response.recipient);

                GiftHistory giftHistory = optionalGiftHistory
                        .filter(gift -> receiver.getKakaoId().equals(gift.getToUserKakaoId()))
                        .orElseThrow(() -> new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION));

                if (giftHistory.isReceived()) return;

                giftHistory.setReceived(true);
                giftHistoryRepository.save(giftHistory);

            } catch (Exception e) {
                log.error("[BatchService] Failed to process handleGiftedEvent txHash: {}", response.log.getTransactionHash(), e);
            }
        });
    }


    private void handleGiftPendingEvent(BigInteger block) {
        List<GifticonNFT.GiftPendingEventResponse> giftPendingEventResponseList = transactionService.getGiftPendingEventByBlockNumber(block);

        giftPendingEventResponseList.parallelStream().forEach(response -> {
            log.info("[BatchService] response: {}", response);
            if (response == null) return;
            try {
                if (giftHistoryRepository.findGiftHistoriesByTxHash(response.log.getTransactionHash()).isEmpty()) {
                    log.info("[BatchService] DB에 저장되지 않은 Hash 값: {}", response.log.getTransactionHash());

                    User receiver = transactionService.getUserByKaKaoId(response.aliasName);

                    giftHistoryRepository.save(
                            GiftHistory.builder()
                                    .fromUserId(transactionService.getUser(response.sender))
                                    .toUserId(receiver.getUserId())
                                    .toUserKakaoId(receiver.getKakaoId())
                                    .gifticon(transactionService.getGifticon(response.tokenId))
                                    .mongoId("67eb5540252c9d3711faf55b") // default card ID
                                    .isReceived(false)
                                    .serialNum(response.serialNumber.longValue())
                                    .createdAt(ConvertUtil.convertTimestampToLocalTime(response.transactionTime))
                                    .txHash(response.log.getTransactionHash())
                                    .build()
                    );
                }
            } catch (Exception e) {
                log.error("[BatchService] Failed to process handleGiftPendingEvent txHash: {}", response.log.getTransactionHash(), e);
            }
        });
    }

    private void handleListForSaleEvent(BigInteger block) {
        List<GifticonNFT.ListedForSaleEventResponse> listedForSaleEventResponses = transactionService.getListedForSaleEventsByBlockNumber(block);

        listedForSaleEventResponses.parallelStream().forEach(response -> {
            log.info("response: {}", response);
            if (response == null) return;
            try {
                if (articleRepository.findArticleByTxHash(response.log.getTransactionHash()).isEmpty()) {
                    log.debug("[BatchService] DB에 저장되지 않은 Hash 값: {}", response.log.getTransactionHash());

                    articleRepository.save(
                            Article.builder()
                                    .currentPrice(response.price.floatValue())
                                    .expirationDate(ConvertUtil.convertTimestampToLocalTime(response.expirationDate))
                                    .title("MISSING")
                                    .description("MISSING")
                                    .imageUrl(ConvertUtil.convertIpfsUrl(response.metadataURI))
                                    .viewCnt(0)
                                    .serialNum(response.serialNumber.longValue())
                                    .countLikes(0)
                                    .gifticon(transactionService.getGifticon(response.tokenId))
                                    .createdAt(ConvertUtil.convertTimestampToLocalTime(response.transactionTime))
                                    .txHash(response.log.getTransactionHash())
                                    .userId(transactionService.getUserId(response.seller))
                                    .state(SaleStatus.ON_SALE)
                                    .build()
                    );
                }
            } catch (Exception e) {
                log.error("[BatchService] Failed to process handleListForSaleEvent txHash: {}", response.log.getTransactionHash(), e);
            }
        });
    }

    private void handlePurchaseEvent(BigInteger block) {
        List<GifticonNFT.NFTPurchasedEventResponse> purchasedEventResponseList = transactionService.getPurchaseEventsByBlockNumber(block);

        purchasedEventResponseList.parallelStream().forEach(response -> {
            if (response == null) return;
            try {
                if (articleHistoryRepository.findByTxHash(response.log.getTransactionHash()).isEmpty()) {
                    log.debug("[BatchService] DB에 저장되지 않은 Hash 값: {}", response.log.getTransactionHash());
                    contractService.addArticleHistory(
                            response.serialNumber.longValue(),
                            response.log.getTransactionHash(),
                            transactionService.getUserId(response.buyer)
                    );
                }
            } catch (Exception e) {
                log.error("[BatchService] Failed to process handlePurchaseEvent txHash: {}", response.log.getTransactionHash(), e);
            }
        });
    }
}
