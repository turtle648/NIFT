-- 외래 키 제약 일시 해제
SET FOREIGN_KEY_CHECKS = 0;

-- 1단계: FK에 종속된 테이블부터 삭제
DELETE FROM likes WHERE 1=1;
DELETE FROM article_histories WHERE 1=1;
DELETE FROM used_histories WHERE 1=1;
DELETE FROM gift_histories WHERE 1=1;

-- 2단계: 중간 테이블
DELETE FROM articles WHERE 1=1;
DELETE FROM gifticons WHERE 1=1;
DELETE FROM sync_status WHERE 1=1;

-- 3단계: 최상위 테이블
DELETE FROM users WHERE 1=1;
DELETE FROM brands WHERE 1=1;
DELETE FROM categories WHERE 1=1;

-- 외래 키 다시 활성화
SET FOREIGN_KEY_CHECKS = 1;
