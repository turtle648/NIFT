package com.e101.nift.gift.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "cards") // nift DB의 cards 컬렉션에 매핑
public class CardDesign {
    @Id
    private String id;

    private boolean isFlipped;
    private String message;
    private String recipientName;

    // 앞 뒤 템플릿
    private Map<String, Object> frontTemplate;
    private Map<String, Object> backTemplate;

    // 앞 뒤 꾸미기 요소들
    private List<Map<String, Object>> frontElements;
    private List<Map<String, Object>> backElements;

    // 캡처 이미지
    private String frontImage;
    private String backImage;
}
