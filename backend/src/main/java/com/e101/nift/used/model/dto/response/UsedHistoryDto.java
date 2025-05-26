package com.e101.nift.used.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsedHistoryDto {
    private Long usedHistoryId;
    private String brandName;
    private String title;
    private LocalDateTime usedAt;
    private String imageUrl;
}
