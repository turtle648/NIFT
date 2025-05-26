package com.e101.nift.user.service;

import com.e101.nift.common.exception.CustomException;
import com.e101.nift.common.exception.ErrorCode;
import com.e101.nift.common.security.JwtTokenProvider;
import com.e101.nift.secondhand.repository.LikeRepository;
import com.e101.nift.user.entity.User;
import com.e101.nift.user.model.dto.response.UserInfoDto;
import com.e101.nift.user.model.state.KakaoApiUrl;
import com.e101.nift.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private final KakaoAuthService kakaoAuthService;
    private final RestTemplateBuilder restTemplateBuilder;
    private final JwtTokenProvider jwtTokenProvider;
    private final LikeRepository likeRepository;

    @Override
    @Transactional
    public UserInfoDto updateNickname(Long kakaoId, String nickname) {
        User user = userRepository.findByKakaoId(kakaoId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setNickName(nickname);
        userRepository.save(user);
        return null;
    }

    @Override
    public UserInfoDto updateWalletAddress(Long kakaoId, String walletAddress) {
        User user = userRepository.findByKakaoId(kakaoId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setWalletAddress(walletAddress);
        userRepository.save(user);
        return null;
    }

    @Override
    public void deleteUser(String jwtToken, String kakaoToken) {

        Long userId = jwtTokenProvider.getUserFromToken(jwtToken).getUserId();

        // 좋아요 데이터부터 삭제
        likeRepository.deleteByUser_UserId(userId);

        kakaoToken = kakaoAuthService.extractKakaoToken(kakaoToken);

        //  카카오 연동 해제
        unlinkedKakaoInfo(kakaoToken);
    }

    @Override
    public String getKakaoId(String accessToken) {
        return "";
    }

    @Transactional(readOnly = true)
    @Override
    public UserInfoDto getUserInfoByUser(Long userId) {
        User user = userRepository.findByUserId(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        log.info("getUserInfoByUser() {}", user);
        // ✅ 4. 모든 정보를 DTO에 담아 반환
        return UserInfoDto.builder()
                .profileImage(user.getProfileImage())
                .nickname(user.getNickName())
                .walletAddress(user.getWalletAddress())
                .kakaoId(user.getKakaoId().toString())
                .role(user.getRole())
                .message("본인 정보를 조회했습니다.")
                .build();
    }

    @Override

    public Optional<Long> findUserIdByAddress(String address) {
        return userRepository.findByWalletAddress(address)
                .flatMap(user -> Optional.ofNullable(user.getUserId()));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getAllUsersWithAddress() {
        return userRepository.findAllByWalletAddressIsNotNull();
    }


    private boolean unlinkedKakaoInfo(String accessToken) {
        log.info("🔍 [UserService] Kakao Unlink API 요청");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Long kakaoId = kakaoAuthService.getKakaoUserInfo(accessToken).getKakaoId();

            String requestBody = "target_id_type=user_id&target_id=" + kakaoId;

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplateBuilder.build()
                    .exchange(
                            KakaoApiUrl.KAKAO_USER_UNLINK.getUrl(),
                            HttpMethod.POST,
                            requestEntity,
                            String.class
                    );

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                log.info("✅ [UserService] Kakao unlink API 응답 성공: {}", jsonNode);
                long responseId = jsonNode.path("id").asLong(-1); // id가 없을 경우 -1 반환

                if(responseId == kakaoId) {
                    userRepository.findByKakaoId(kakaoId)
                            .ifPresentOrElse(userRepository::delete, () -> {
                                throw new CustomException(ErrorCode.INVALID_REQUEST);
                            });

                    return true;
                }
                else {
                    log.error("❌ [UserService] Kakao unlink API 응답 ID 불일치: 요청 ID={}, 응답 ID={}",
                            kakaoId, responseId);
                    throw new CustomException(ErrorCode.INVALID_REQUEST);
                }
            } else {
                log.error("❌ [UserService] Kakao API 호출 실패: statusCode={}", response.getStatusCode());
                throw new CustomException(ErrorCode.INVALID_REQUEST);
            }
        } catch (Exception e) {
            log.error("❌ [UserService] Kakao API 응답 파싱 실패: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.INVALID_REQUEST);
        }
    }
}
