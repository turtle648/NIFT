package com.e101.nift.secondhand.service;

import com.e101.nift.gifticon.entity.Gifticon;
import com.e101.nift.secondhand.entity.Article;
import com.e101.nift.secondhand.model.contract.GifticonNFT;
import com.e101.nift.user.entity.User;

import java.math.BigInteger;
import java.util.List;

public interface TransactionService {
    BigInteger getLatestBlockNumber();
    List<GifticonNFT.NFTPurchasedEventResponse> getPurchaseEventsByTxHash(String txHash);
    List<GifticonNFT.ListedForSaleEventResponse> getListedForSaleEventByTxHash(String txHash);
    List<GifticonNFT.CancelledSaleEventResponse> getCancelledSaleEventByTxHash(String txHash);
    List<GifticonNFT.GiftPendingEventResponse> getGiftPendingEventByTxHash(String txHash);
    List<GifticonNFT.GiftedEventResponse> getGiftedEventByTxHash(String txHash);
    List<GifticonNFT.RedeemedEventResponse> getRedeemedEventByTxHash(String txHash);
    List<BigInteger> getBlockNumbersFrom(BigInteger startBlock);
    List<GifticonNFT.NFTPurchasedEventResponse> getPurchaseEventsByBlockNumber(BigInteger blockNumber);
    List<GifticonNFT.ListedForSaleEventResponse> getListedForSaleEventsByBlockNumber(BigInteger blockNumber);
    List<GifticonNFT.GiftPendingEventResponse> getGiftPendingEventByBlockNumber(BigInteger blockNumber);
    List<GifticonNFT.GiftedEventResponse> getGiftedEventByBlockNumber(BigInteger blockNumber);
    Gifticon getGifticon(BigInteger gifticonId);
    Long getUserId(String userAddress);
    User getUser(String userAddress);
    User getUserByKaKaoId(String kakaoId);
    Article getArticle(BigInteger serialNumber);
}
