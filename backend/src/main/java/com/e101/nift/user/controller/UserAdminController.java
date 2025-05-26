package com.e101.nift.user.controller;


import com.e101.nift.user.entity.User;
import com.e101.nift.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserService userService;

    @GetMapping("/users/with-address")
    @Operation(summary = "address를 가진 모든 사용자 조회")
    public ResponseEntity<List<User>> getAlUsersWithAddress() {
        List<User> users = userService.getAllUsersWithAddress();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/user")
    @Operation(summary = "관리자 계정의 회원 조회", description = "모든 사용자의 정보를 조회합니다")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
}
