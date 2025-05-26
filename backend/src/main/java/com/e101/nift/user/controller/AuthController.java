package com.e101.nift.user.controller;

import com.e101.nift.common.security.JwtTokenProvider;
import com.e101.nift.user.entity.User;
import com.e101.nift.user.model.dto.request.NicknameDTO;
import com.e101.nift.user.model.dto.response.UserLoginDto;
import com.e101.nift.user.service.KakaoAuthService;
import com.e101.nift.user.service.UserService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = {
        "http://localhost:3000",
        "https://j12e101.p.ssafy.io"
}) // 모든 메소드 허용
@RequestMapping("/auth")
public class AuthController {

    private final KakaoAuthService kakaoAuthService;
    private final UserService userService; // DB에서 사용자 조회
    private final JwtTokenProvider jwtTokenProvider; // JWT 유틸

    @PostMapping("/login")
    public ResponseEntity<UserLoginDto> kakaoLogin(@RequestBody Map<String, String> request) {
        String accessToken = request.get("accessToken");

        log.info("accessToken: {}", accessToken);

        User user = kakaoAuthService.getKakaoUserInfo(accessToken);

        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        String jwtToken = jwtTokenProvider.generateToken(user.getUserId());

        log.info("카카오 로그인 완료: ID={}, 닉네임={}", user.getKakaoId(), user.getNickName());

        // ✅ UserLoginDto 사용하여 반환
        UserLoginDto userLoginDto = new UserLoginDto(jwtToken, user.getUserId());

        return ResponseEntity.ok(userLoginDto);
    }



    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원가입 성공"),
            @ApiResponse(responseCode = "400", description = "입력값 검증 실패",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody NicknameDTO.UserSignupDto requestDto) {
        return ResponseEntity.ok("회원가입 성공");
    }
}
