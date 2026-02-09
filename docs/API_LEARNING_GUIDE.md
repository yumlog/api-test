# API 연동 학습 가이드

## 현재 배운 내용

### 1. HTTP 메서드

| 메서드 | 용도        | 예시                   |
| ------ | ----------- | ---------------------- |
| GET    | 데이터 조회 | 게시글 목록, 상세 조회 |
| POST   | 데이터 생성 | 새 게시글 작성         |
| PUT    | 데이터 수정 | 게시글 수정            |
| DELETE | 데이터 삭제 | 게시글 삭제            |

### 2. fetch API 기본 구조

```typescript
// GET 요청 (기본)
fetch("https://api.example.com/posts")
  .then((response) => response.json())
  .then((data) => console.log(data));

// POST/PUT 요청
fetch("https://api.example.com/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "제목",
    body: "내용",
  }),
});
```

### 3. headers vs body

- **headers**: 메타 정보 (데이터 형식, 인증 토큰 등)
- **body**: 실제 전송할 데이터 (JSON.stringify로 문자열 변환 필요)

### 4. 상태 관리 패턴

```typescript
const [data, setData] = useState([]); // 데이터
const [loading, setLoading] = useState(true); // 로딩 상태
const [error, setError] = useState(null); // 에러 상태
```

### 5. 쿼리 파라미터 (Pagination)

```
/posts?_page=1&_limit=10
```

- `_page`: 페이지 번호
- `_limit`: 페이지당 항목 수

### 6. 관계형 데이터 조회

```
/posts/1/comments  → 1번 게시글의 댓글 목록
```

---

## 추가 학습 주제

### 1. async/await 문법

`.then()` 체이닝 대신 더 읽기 쉬운 문법

```typescript
// 현재 방식 (.then 체이닝)
const fetchPosts = () => {
  fetch(url)
    .then((response) => response.json())
    .then((data) => setPosts(data))
    .catch((error) => setError(error.message));
};

// async/await 방식
const fetchPosts = async () => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    setPosts(data);
  } catch (error) {
    setError(error.message);
  }
};
```

**장점**:

- 코드가 위에서 아래로 순차적으로 읽힘
- try/catch로 에러 처리가 직관적

---

### 2. Custom Hook (useFetch)

반복되는 fetch 로직을 재사용 가능한 훅으로 분리

```typescript
// hooks/useFetch.ts
const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
};

// 사용법
const { data: posts, loading, error } = useFetch<Post[]>("/api/posts");
```

**장점**:

- 코드 중복 제거
- 일관된 로딩/에러 처리
- 테스트 용이

---

### 3. Abort Controller

컴포넌트 언마운트 시 진행 중인 요청 취소 (메모리 누수 방지)

```typescript
useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => setPosts(data))
    .catch((err) => {
      if (err.name !== "AbortError") {
        setError(err.message);
      }
    });

  // cleanup 함수: 컴포넌트 언마운트 시 요청 취소
  return () => controller.abort();
}, [url]);
```

**사용 시점**:

- 페이지 이동 시
- 검색어 빠르게 변경 시 (이전 요청 취소)

---

### 4. Optimistic Update

서버 응답을 기다리지 않고 UI 먼저 업데이트, 실패 시 롤백

```typescript
const handleDelete = async (postId: number) => {
  // 1. 현재 상태 백업
  const previousPosts = [...posts];

  // 2. UI 먼저 업데이트 (낙관적)
  setPosts(posts.filter((post) => post.id !== postId));

  try {
    // 3. 서버 요청
    const response = await fetch(`/posts/${postId}`, { method: "DELETE" });
    if (!response.ok) throw new Error("삭제 실패");
  } catch (error) {
    // 4. 실패 시 롤백
    setPosts(previousPosts);
    alert("삭제에 실패했습니다.");
  }
};
```

**장점**:

- 사용자 체감 속도 향상
- 즉각적인 피드백

---

### 5. Debounce / Throttle

검색 입력 시 API 호출 최적화

```typescript
// Debounce: 입력이 멈춘 후 일정 시간 뒤에 실행
const [searchTerm, setSearchTerm] = useState("");
const [debouncedTerm, setDebouncedTerm] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedTerm(searchTerm);
  }, 300); // 300ms 대기

  return () => clearTimeout(timer);
}, [searchTerm]);

useEffect(() => {
  if (debouncedTerm) {
    fetch(`/posts?search=${debouncedTerm}`);
  }
}, [debouncedTerm]);
```

**Debounce vs Throttle**:

- Debounce: 마지막 입력 후 일정 시간 대기 (검색에 적합)
- Throttle: 일정 시간 간격으로 실행 (스크롤 이벤트에 적합)

---

### 6. 인증/인가 (Authentication)

JWT 토큰을 사용한 인증 요청

```typescript
// 로그인 후 받은 토큰 저장
localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIs...");

// 인증이 필요한 API 요청
fetch("/api/protected", {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
```

**주요 개념**:

- JWT (JSON Web Token): 서버가 발급하는 인증 토큰
- Bearer Token: Authorization 헤더에 포함
- 토큰 만료 처리, 리프레시 토큰

---

### 7. React Query / TanStack Query

실무에서 많이 사용하는 서버 상태 관리 라이브러리

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// GET 요청
const { data, isLoading, error } = useQuery({
  queryKey: ["posts"],
  queryFn: () => fetch("/posts").then((res) => res.json()),
});

// POST/PUT/DELETE 요청
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (newPost) =>
    fetch("/posts", {
      method: "POST",
      body: JSON.stringify(newPost),
    }),
  onSuccess: () => {
    // 캐시 무효화하여 목록 새로고침
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  },
});
```

**장점**:

- 자동 캐싱 및 백그라운드 업데이트
- 로딩/에러 상태 자동 관리
- 자동 재시도 (retry)
- 윈도우 포커스 시 자동 refetch
- 페이지네이션, 무한 스크롤 지원

---

## 학습 순서 추천

1. **async/await** - 기본 문법 개선
2. **Custom Hook** - 코드 재사용성
3. **Abort Controller** - 메모리 누수 방지
4. **Debounce** - 검색 기능 최적화
5. **Optimistic Update** - UX 향상
6. **인증/인가** - 실제 서비스 필수
7. **React Query** - 실무 라이브러리

---

## 참고 자료

- [MDN - Fetch API](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API)
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) - 무료 테스트 API
- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
