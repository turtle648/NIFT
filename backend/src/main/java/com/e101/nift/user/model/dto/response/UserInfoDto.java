package com.e101.nift.user.model.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Getter
@Builder
@ToString
public class UserInfoDto {

    private final String profileImage;

    private final String nickname;

    private final String walletAddress;
    private final String kakaoId;
    private int role; // 사용자 0, 매장 관리자 1, 차단된 사용자 2
    @Builder.Default
    private final String message = "본인 정보를 조회했습니다.";
}