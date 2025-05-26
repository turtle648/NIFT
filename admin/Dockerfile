# Node.js 18 기반 이미지
FROM node:18

# 작업 디렉토리 설정
WORKDIR /app

ARG PORT 
# ENV에 ARG 값 넣기
ENV PORT=${PORT}

# Docker Compose에서 넘긴 NODE_ENV를 받음
ARG BUILD_MODE

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (package-lock.json을 100% 따름)
RUN npm ci

# 전체 프로젝트 복사
COPY . .

# 🧪 빌드시 사용할 환경변수 복사
COPY .env .env

# NODE_ENV에 따라 build 분기
RUN if [ "$BUILD_MODE" = "development" ]; then \
    npm run build --verbose && rm -f .env; \
  else \
    npm run build && rm -f .env; \
  fi

# 컨테이너 실행 시 Next.js 실행
CMD ["npm", "run", "start"]