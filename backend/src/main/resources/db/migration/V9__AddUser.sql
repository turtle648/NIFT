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


INSERT INTO users (user_id, kakao_id, nick_name, wallet_address, profile_image, gender, age, role) VALUES
                                                                                                       (1, 3976389070, '영민', '0xa7B9A191107081f780E534502C1B2288cFB7cC03', 'http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg', 'female', '20~29', 0),
                                                                                                       (2, 3977733962, '김도원', '0x4ED78E0a67c2F984D4985D490aAA5bC36340263F', 'http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg', 'male', '20~29', 1),
                                                                                                       (3, 3977722266, '권유주', '0xc3c0Da7063617cA28e93A1cf0D53531c46A00AFd', 'http://k.kakaocdn.net/dn/czGA5m/btsLstCuIrI/fOphbzalRQZ0cumUvxzSsk/img_640x640.jpg', 'female', '20~29', 0),
                                                                                                       (4, 4006498484, '조원주', null, 'http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg', 'female', '20~29', 0),
                                                                                                       (5, 4100972657, '미서', '0xad241218a3C90a5c7bBd05F87DA4738676AF77b4', 'http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://k.kakaocdn.net/dn/bbaJYy/btsLMVr5aKx/CalKUSbvMKHl7tnAnvlkk0/img_640x640.jpg', 'female', '20~29', 0),
                                                                                                       (6, 4001926433, '희진', '0xe911090F1ca13EE23f3C1eE964c5d4e323987e9f', 'http://k.kakaocdn.net/dn/SCVgq/btsMcgPB7HK/L5YqXujKoAFLlP7DcKBTck/img_640x640.jpg', 'female', '20~29', 0);


INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (1,'던킨도너츠 - 미니도넛세트','미니도넛세트','https://ipfs.io/ipfs/QmetmTc5SHEeHGPtNMpksPn3UFz2qMLrMMtGynKRxm7V7R',15,3,2,'2025-04-08 12:03:03.814000','ipfs://QmRQP6kU7YLGa8TyHm6mNTin1GnfThuqLtFbUvteufMBMs');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (2,'던킨도너츠 - 해피먼치킨컵','해피먼치킨컵','https://ipfs.io/ipfs/QmPs2ZF76FKBcM3cp1b7Ka5fLDh9C6QuKDppnzgj8DweX3',8.5,3,2,'2025-04-08 12:03:50.564000','ipfs://QmNhGueS9RXUzhCMobsdVo4uUoNu8A372hYXWEEf52zirN');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (3,'던킨도너츠 - 바바리안필드','바바리안필드','https://ipfs.io/ipfs/QmdcBqoEsc73YMNYsQ9zyskzuKV8mavZdTJmBJ5Yfu92uF',5.5,3,2,'2025-04-08 12:04:15.772000','ipfs://QmZBjhebmxhoWgXcyDLeF4kq93ddtbv7evkBD6ymYxXNVq');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (4,'던킨도너츠 - 올리브츄이스티','올리브츄이스티','https://ipfs.io/ipfs/QmQ2wxqQKSWYqezibwqvcN5zPDoorthdJRWbejsaWboTPa',4,3,2,'2025-04-08 12:05:01.813000','ipfs://QmPhM9KwAwvFA6a2kJxQSn9k8ZpjjdLdz6nYXkRhm5r4sZ');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (5,'스타벅스 - 딸기초코생크림케이크','딸기초코생크림케이크','https://ipfs.io/ipfs/QmPzcWY5wmH7cZGRVZAcjJJG3SjLiM3XfrC7XNkQtdZA9P',6.9,2,1,'2025-04-08 12:06:00.294000','ipfs://QmdcP4EKoQiq8FzCBTJ4nf1V394xwa6H7bgr7LaLg3vHNV');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (6,'스타벅스 - 딸기마스카포네샌드케이크','딸기마스카포네샌드케이크','https://ipfs.io/ipfs/QmW4cPyWiLJQxLEM5eriWqQZw7xz3ncjSrH2qa57QfvhQx',8.8,2,1,'2025-04-08 12:06:29.643000','ipfs://Qmcx64N9aLj6ieXcwEkRN2P95iqLHupw5ccagasonuntdY');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (7,'스타벅스 - 블루베리마블치즈케이크','블루베리마블치즈케이크','https://ipfs.io/ipfs/QmSxMKv2mR9LT7rrutjJnUuJhYsuEtxqiafbM7kgLPGF9Z',9,2,1,'2025-04-08 12:07:14.712000','ipfs://QmRcD2gwEvF1pYY9N3ZUL8DDZTXKVEYL31pk7bHa18mCew');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (8,'스타벅스 - 라즈베리쇼콜라','라즈베리쇼콜라','https://ipfs.io/ipfs/QmVBn17MoNsf8tmdiY9c96KQps12jpX17HGyFjX3eGGmcE',5,2,1,'2025-04-08 12:09:56.281000','ipfs://QmRSYDsmqGJrvDPNSACDDApeCh24PPbh38rHQHnURM2sbF');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (9,'스타벅스 - 자바칩프라푸치노','자바칩프라푸치노','https://ipfs.io/ipfs/QmR7g9FET7ysmiDb5txTrExFm5uq4hhJX2ZJnkPtei9KFF',6,2,1,'2025-04-08 12:10:53.971000','ipfs://Qmby1xr17HdaGfxiQdSCjjz96VYhizdei2skDEioPFmgkn');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (10,'스타벅스 - 바닐라빈라떼','바닐라빈라떼','https://ipfs.io/ipfs/QmUh1Xoyi3WXsP7hc8VqhTtZ96yzVWX1KMeexLa9aemmDp',5,2,1,'2025-04-08 12:11:21.845000','ipfs://QmUVDQFoYinAQS2PU2RruT2AS12BjLNGKhwPJtGTeSoLyR');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (11,'이디야커피 - 버블크림밀크티','버블크림밀크티','https://ipfs.io/ipfs/QmcAuzA2Va74JRP7qhMhaDVZqdNjPJZfJC6KcFiY6vbbCC',8,1,1,'2025-04-08 12:11:52.237000','ipfs://QmY7Gn4PW6tWww5LNYMsy3yxpNA3oERf5F9KHJm76dN57n');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (12,'이디야커피 - 아이스아메리카노','아이스아메리카노','https://ipfs.io/ipfs/QmV78VnySm9LKyhkTh9HHjropXAgGEGcRvPJSjEBFj975B',3,1,1,'2025-04-08 12:12:18.674000','ipfs://Qmc6pxxi3hTjrSNaTXKQJyAbN9ht8cozLdzLZD5uwjvZLv');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (13,'이디야커피 - 모히또','모히또','https://ipfs.io/ipfs/QmTzuAVakpZs1KC2Ks4Y8v6CYHU9ZzB36AdXEacTnJC3xV',6,1,1,'2025-04-08 12:13:21.250000','ipfs://QmSzMedWNq4R5rB6FPKJQWKEagpYaoN6z9CYJt6f98ndn9');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (14,'이디야커피 - 아망추','아망추','https://ipfs.io/ipfs/QmPUtyXW2jrh65gFAcJatuuRT3aE9mYPNMYCynXbn1tUWs',6,1,1,'2025-04-08 12:14:13.421000','ipfs://QmPpcEPgZLDnY3fZ4RRZgrWPFTUrodFTZyZcfhNzWJjQpY');
INSERT INTO `gifticons` (`gifticon_id`,`description`,`gifticon_title`,`image_url`,`price`,`brand_id`,`category_id`,`created_at`,`metadata_url`) VALUES (15,'이디야커피 - 핫아메리카노','핫아메리카노','https://ipfs.io/ipfs/QmZdpwEDwcajKC9NsLhCrLTUA9eu7GGM3VsbSWhaveuJX4',3,1,1,'2025-04-08 12:14:57.220000','ipfs://QmW1ks3GZ31WWjgEmB47vWDTkpei8tFDaoqhfYx7yHWeYf');

-- 6. 안전모드 다시 켜기
SET SQL_SAFE_UPDATES = 1;
