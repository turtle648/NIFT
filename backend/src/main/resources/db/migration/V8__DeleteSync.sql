-- 안전 모드 비활성화
SET SQL_SAFE_UPDATES = 0;

-- 외래 키 제약 일시 해제
SET FOREIGN_KEY_CHECKS = 0;

-- 1단계: FK에 종속된 테이블부터 삭제
DELETE FROM likes;
DELETE FROM article_histories;
DELETE FROM used_histories;
DELETE FROM gift_histories;

DELETE FROM articles;
DELETE FROM gifticons;
DELETE FROM sync_status;

DELETE FROM users;
DELETE FROM brands;
DELETE FROM categories;

-- 외래 키 다시 활성화
SET FOREIGN_KEY_CHECKS = 1;

-- 2단계: 상위 테이블부터 데이터 입력
INSERT INTO brands (brand_id, brand_name) VALUES
                                              (1, '이디야커피'), (2, '스타벅스'), (3, '던킨도너츠'), (4, '배스킨라빈스'), (5, '교촌치킨'),
                                              (6, '버거킹'), (7, '맥도날드'), (8, 'BBQ'), (9, '굽네치킨'), (10, '파리바게뜨'),
                                              (11, '뚜레쥬르'), (12, '이마트24'), (13, 'GS25'), (14, 'CU'), (15, '컬리'),
                                              (16, '신세계상품권'), (17, '교보문고'), (18, 'YES24'), (19, '투썸플레이스'), (20, 'CGV');

INSERT INTO categories (category_id, category_name) VALUES
                                                        (1, '카페/음료'), (2, '베이커리/디저트'), (3, '아이스크림/빙수'), (4, '치킨'),
                                                        (5, '버거/피자'), (6, '편의점/마트'), (7, '상품권/금액권'), (8, '영화/도서'), (9, '생활용품');

-- 6. 안전모드 다시 켜기
SET SQL_SAFE_UPDATES = 1;
