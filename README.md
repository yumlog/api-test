# API Test

## 1. 프로젝트 개요

API 테스트를 위한 React 기반 웹 애플리케이션입니다.

## 2. 프로젝트 구조

```
api-test/
├── public/              # 정적 파일
├── src/
│   ├── assets/          # 이미지, 아이콘 등 에셋
│   ├── lib/             # 유틸리티 함수
│   ├── App.tsx          # 메인 앱 컴포넌트
│   ├── main.tsx         # 앱 진입점
│   └── index.css        # 전역 스타일
├── index.html           # HTML 템플릿
├── package.json         # 프로젝트 설정 및 의존성
├── vite.config.ts       # Vite 설정
├── tsconfig.json        # TypeScript 설정
└── eslint.config.js     # ESLint 설정
```

## 3. 빠른 시작

```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev

# 프로덕션 빌드
yarn build

# 빌드 결과물 미리보기
yarn preview
```

## 4. 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 빌드 도구 | Vite |
| 스타일링 | Tailwind CSS |
| UI 컴포넌트 | Radix UI, shadcn/ui |
| 아이콘 | Lucide React |
| 린팅 | ESLint |

## 5. 개발 환경

- Node.js 18 이상
- Yarn 패키지 매니저
- TypeScript 5.9
