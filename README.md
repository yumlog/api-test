# API Test

## 1. 프로젝트 개요

프론트엔드 API 연동 학습을 위한 React 기반 웹 애플리케이션입니다.
JSONPlaceholder API를 사용하여 CRUD(Create, Read, Update, Delete) 기능을 구현합니다.

## 2. 프로젝트 구조

```
api-test/
├── public/                    # 정적 파일
├── src/
│   ├── assets/                # 이미지, 아이콘 등 에셋
│   ├── components/
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx     # 상단 헤더
│   │   │   ├── Sidebar.tsx    # 사이드바
│   │   │   ├── MainLayout.tsx # 전체 레이아웃
│   │   │   └── index.ts       # export 모음
│   │   └── ui/                # shadcn/ui 컴포넌트
│   ├── lib/                   # 유틸리티 함수
│   ├── App.tsx                # 메인 앱 컴포넌트 (API 로직)
│   ├── main.tsx               # 앱 진입점
│   └── index.css              # 전역 스타일 (Pretendard 폰트)
├── docs/
│   └── API_LEARNING_GUIDE.md  # API 학습 가이드 문서
├── index.html                 # HTML 템플릿
├── package.json               # 프로젝트 설정 및 의존성
├── vite.config.ts             # Vite 설정
├── tsconfig.json              # TypeScript 설정
└── eslint.config.js           # ESLint 설정
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
| 폰트 | Pretendard |
| 린팅 | ESLint |
| API | JSONPlaceholder |

## 5. 주요 기능

### HTTP 메서드
- **GET**: 게시글 목록/상세 조회, 댓글 조회
- **POST**: 새 게시글 작성
- **PUT**: 게시글 수정
- **DELETE**: 게시글 삭제

### 기능 목록
- 게시글 CRUD
- 페이지네이션 (쿼리 파라미터)
- 관계형 데이터 (게시글 → 댓글)
- 로딩/에러 상태 처리

## 6. 개발 환경

- Node.js 18 이상
- Yarn 패키지 매니저
- TypeScript 5.9

## 7. 학습 자료

자세한 API 연동 학습 내용은 [docs/API_LEARNING_GUIDE.md](./docs/API_LEARNING_GUIDE.md)를 참고하세요.
