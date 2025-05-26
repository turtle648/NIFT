package com.e101.nift.secondhand.service;

import com.e101.nift.gifticon.entity.Gifticon;
import com.e101.nift.gifticon.repository.GifticonRepository;
import com.e101.nift.secondhand.entity.Article;
import com.e101.nift.secondhand.exception.ArticleErrorCode;
import com.e101.nift.secondhand.exception.ArticleException;
import com.e101.nift.secondhand.model.contract.GifticonNFT;
import com.e101.nift.secondhand.model.state.SaleStatus;
import com.e101.nift.secondhand.repository.ArticleRepository;
import com.e101.nift.user.entity.User;
import com.e101.nift.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.io.IOException;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
    private final Web3j web3j;

    @Value("${web3j.contract.address}")
    private String contractAddress;

    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final GifticonRepository gifticonRepository;

    @Override
    public BigInteger getLatestBlockNumber() {
        try {
            return web3j.ethBlockNumber().send().getBlockNumber();
        } catch (IOException e) {
            log.error("[TransactionService] 마지막 블록 가져오기 실패: {}", e.getMessage());
            throw new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION);
        }
    }

    @Override
    public List<GifticonNFT.NFTPurchasedEventResponse> getPurchaseEventsByTxHash(String txHash) {
        TransactionReceipt receipt = getSuccessfulTransactionReceipt(txHash);

        List<GifticonNFT.NFTPurchasedEventResponse> events = GifticonNFT.getNFTPurchasedEvents(receipt);

        if (events.isEmpty()) {
            log.error("[TransactionService] No purchase events found for transaction: {}", txHash);
            throw new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION);
        }

        return events;
    }

    @Override
    public List<GifticonNFT.ListedForSaleEventResponse> getListedForSaleEventByTxHash(String txHash) {
        TransactionReceipt receipt = getSuccessfulTransactionReceipt(txHash);

        List<GifticonNFT.ListedForSaleEventResponse> events = GifticonNFT.getListedForSaleEvents(receipt);
        log.info("[TransactionService] getListedForSaleEvents : {}", events);
        if (events.isEmpty()) {
            log.error("[TransactionService] No purchase events found for transaction: {}", txHash);
            throw new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION);
        }

        return events;
    }

    @Override
    public List<GifticonNFT.CancelledSaleEventResponse> getCancelledSaleEventByTxHash(String txHash) {
        TransactionReceipt receipt = getSuccessfulTransactionReceipt(txHash);

        List<GifticonNFT.CancelledSaleEventResponse> events = GifticonNFT.getCancelledSaleEvents(receipt);
        log.info("[TransactionService] getCancelledSaleEvents : {}", events);
        if (events.isEmpty()) {
            log.error("[TransactionService] No cancelled events found for transaction: {}", txHash);
            throw new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION);
        }

        return events;
    }

    @Override
    public List<GifticonNFT.GiftPendingEventResponse> getGiftPendingEventByTxHash(String txHash) {
        TransactionReceipt receipt = getSuccessfulTransactionReceipt(txHash);

        List<GifticonNFT.GiftPendingEventResponse> events = GifticonNFT.getGiftPendingEvents(receipt);
        log.info("[TransactionService] getGiftPendingEvents : {}", events);
        if (events.isEmpty()) {
            log.error("[TransactionService] No gift pending events found for transaction: {}", txHash);
            throw new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION);
        }

        return events;
    }

    @Override
    public List<GifticonNFT.GiftedEventResponse> getGiftedEventByTxHash(String txHash) {
        TransactionReceipt receipt = getSuccessfulTransactionReceipt(txHash);

        List<GifticonNFT.GiftedEventResponse> events = GifticonNFT.getGiftedEvents(receipt);
        log.info("[TransactionService] getGiftedEvents : {}", events);
        if (events.isEmpty()) {
            log.error("[TransactionService] No gift events found for transaction: {}", txHash);
            throw new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION);
        }

        return events;
    }

    @Override
    public List<GifticonNFT.RedeemedEventResponse> getRedeemedEventByTxHash(String txHash) {
        TransactionReceipt receipt = getSuccessfulTransactionReceipt(txHash);

        List<GifticonNFT.RedeemedEventResponse> events = GifticonNFT.getRedeemedEvents(receipt);
        log.info("[TransactionService] getRedeemedEvents : {}", events);
        if (events.isEmpty()) {
            log.error("[TransactionService] No redeem events found for transaction: {}", txHash);
            throw new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION);
        }

        return events;
    }

    @Override
    public List<BigInteger> getBlockNumbersFrom(BigInteger startBlock) {
        try {
            List<BigInteger> blockNumbers = new ArrayList<>();

            for (int i = 0; i < 10; i++) {
                blockNumbers.add(startBlock.add(BigInteger.valueOf(i)));
            }

            log.debug("[TransactionService] getBlockNumbersFrom: {}", blockNumbers);
            return blockNumbers;
        } catch (Exception e) {
            log.error("[TransactionService] Failed to fetch block numbers from {}", startBlock, e);
            throw new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION);
        }
    }

    @Override
    public List<GifticonNFT.NFTPurchasedEventResponse> getPurchaseEventsByBlockNumber(BigInteger blockNumber) {
        List<org.web3j.protocol.core.methods.response.Log> logs = getResponseLogs(blockNumber);

        List<GifticonNFT.NFTPurchasedEventResponse> events = new ArrayList<>();

        for (org.web3j.protocol.core.methods.response.Log logg : logs) {
            try {
                GifticonNFT.NFTPurchasedEventResponse event = GifticonNFT.getNFTPurchasedEventFromLog(logg);
                events.add(event);
            } catch (NullPointerException e) {
                log.error("이 로그는 NFTPurchased 이벤트가 아닙니다 (NPE 캐치됨)");
            }
        }

        return events;
    }

    @Override
    public List<GifticonNFT.ListedForSaleEventResponse> getListedForSaleEventsByBlockNumber(BigInteger blockNumber) {
        List<org.web3j.protocol.core.methods.response.Log> logs = getResponseLogs(blockNumber);

        List<GifticonNFT.ListedForSaleEventResponse> events = new ArrayList<>();

        for (org.web3j.protocol.core.methods.response.Log logg : logs) {
            log.info("로그 내용: address={}, topics={}, data={}", logg.getAddress(), logg.getTopics(), logg.getData());

            try {
                GifticonNFT.ListedForSaleEventResponse event = GifticonNFT.getListedForSaleEventFromLog(logg);
                events.add(event);
            } catch (NullPointerException e) {
                log.error("이 로그는 ListedForSale 이벤트가 아닙니다 (NPE 캐치됨)");
            }
        }

        return events;
    }

    @Override
    public List<GifticonNFT.GiftPendingEventResponse> getGiftPendingEventByBlockNumber(BigInteger blockNumber) {
        List<org.web3j.protocol.core.methods.response.Log> logs = getResponseLogs(blockNumber);

        List<GifticonNFT.GiftPendingEventResponse> events = new ArrayList<>();

        for (org.web3j.protocol.core.methods.response.Log logg : logs) {
            log.info("로그 내용: address={}, topics={}, data={}", logg.getAddress(), logg.getTopics(), logg.getData());

            try {
                GifticonNFT.GiftPendingEventResponse event = GifticonNFT.getGiftPendingEventFromLog(logg);
                events.add(event);
            } catch (NullPointerException e) {
                log.error("이 로그는 GiftPendingEvent가 아닙니다 (NPE 캐치됨)");
            }
        }

        return events;
    }

    @Override
    public List<GifticonNFT.GiftedEventResponse> getGiftedEventByBlockNumber(BigInteger blockNumber) {
        List<org.web3j.protocol.core.methods.response.Log> logs = getResponseLogs(blockNumber);

        List<GifticonNFT.GiftedEventResponse> events = new ArrayList<>();

        for (org.web3j.protocol.core.methods.response.Log logg : logs) {
            log.info("로그 내용: address={}, topics={}, data={}", logg.getAddress(), logg.getTopics(), logg.getData());

            try {
                GifticonNFT.GiftedEventResponse event = GifticonNFT.getGiftedEventFromLog(logg);
                events.add(event);
            } catch (NullPointerException e) {
                log.error("이 로그는 GiftedEvent 이벤트가 아닙니다 (NPE 캐치됨)");
            }
        }

        return events;
    }

    private Optional<TransactionReceipt> getTransactionReceipt(String txHash) {
        try {
            EthGetTransactionReceipt receiptResponse = web3j.ethGetTransactionReceipt(txHash).send();
            return receiptResponse.getTransactionReceipt();
        } catch (IOException e) {
            log.error("[TransactionService] Failed to get transaction receipt for txHash: {}", txHash, e);
            throw new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION);
        }
    }

    private TransactionReceipt getSuccessfulTransactionReceipt(String txHash) {
        Optional<TransactionReceipt> receiptOpt = getTransactionReceipt(txHash);
        return receiptOpt
                .filter(TransactionReceipt::isStatusOK)
                .orElseThrow(() -> {
                    log.error("[TransactionService] Transaction failed or not processed: {}", txHash);
                    return new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION);
                });
    }

    private List<org.web3j.protocol.core.methods.response.Log> getResponseLogs(BigInteger blockNumber) {
        try {
            EthFilter filter = new EthFilter(
                    DefaultBlockParameter.valueOf(blockNumber),
                    DefaultBlockParameter.valueOf(blockNumber),
                    this.contractAddress
            );

            List<org.web3j.protocol.core.methods.response.Log> logs = web3j.ethGetLogs(filter).send().getLogs()
                    .stream()
                    .map(logResult -> (org.web3j.protocol.core.methods.response.Log) logResult.get())
                    .toList();
            log.info("블록 [{}] 에서 가져온 로그 개수: {}", blockNumber, logs.size());
            return logs;

        } catch (IOException e) {
            log.error("[TransactionService] Failed to fetch list_for_sale events for block: {}", blockNumber, e);
            throw new ArticleException(ArticleErrorCode.TRANSACTION_EXCEPTION);
        }
    }

    @Override
    public Gifticon getGifticon(BigInteger gifticonId) {
        Gifticon gifticon = gifticonRepository.findById(gifticonId.longValue())
                .orElseThrow(() -> new ArticleException(ArticleErrorCode.UNPROCESSABLE_TRANSACTION));
        log.info("[TransactionService] getGifticon: {}", gifticon);
        return gifticon;
    }

    @Override
    public Long getUserId(String userAddress) {
        Long id =  userRepository.findByWalletAddress(userAddress)
                .orElseThrow(() -> new ArticleException(ArticleErrorCode.CANNOT_FIND_BY_ADDRESS))
                .getUserId();
        log.info("[TransactionService] getUserId: {}", id);
        return id;
    }

    @Override
    public User getUser(String userAddress) {
        User user =  userRepository.findByWalletAddress(userAddress)
                .orElseThrow(() -> new ArticleException(ArticleErrorCode.CANNOT_FIND_BY_ADDRESS));
        log.info("[TransactionService] getUser: {}", user);
        return user;
    }

    @Override
    public User getUserByKaKaoId(String kakaoId) {
        User user =  userRepository.findByKakaoId(Long.valueOf(kakaoId))
                .orElseThrow(() -> new ArticleException(ArticleErrorCode.CANNOT_FIND_BY_ADDRESS));
        log.info("[TransactionService] getUserByKaKaoId: {}", user);
        return user;

    }


    @Override
    public Article getArticle(BigInteger serialNumber) {
        Article article = articleRepository.findArticleBySerialNumAndState(serialNumber.longValue(), SaleStatus.ON_SALE)
                .orElseThrow(() -> new ArticleException(ArticleErrorCode.UNPROCESSABLE_TRANSACTION));
        log.info("[TransactionService] getArticle: {}", article);
        return article;
    }

}


