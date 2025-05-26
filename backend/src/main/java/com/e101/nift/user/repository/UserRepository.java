package com.e101.nift.user.repository;

import com.e101.nift.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByKakaoId(Long kakaoId);
    Optional<User> findByUserId(Long userId);
    Optional<User> findByWalletAddress(String address);
    List<User> findAllByWalletAddressIsNotNull();
}
