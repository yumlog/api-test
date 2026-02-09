import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 게시글 타입 정의
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

function App() {
  /*
    상태(State) 관리
    - posts        : 게시글 목록
    - loading      : 로딩 상태
    - error        : 에러 메시지
    - newTitle     : 새 게시글 제목 입력값
    - newBody      : 새 게시글 내용 입력값
    - isSubmitting : 폼 제출 중 여부
  */
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
    GET 요청 - 게시글 목록 가져오기
    - useEffect       : 컴포넌트가 처음 렌더링될 때 실행
    - fetch(url)      : 서버에 GET 요청 (기본값이 GET이라 method 생략 가능)
    - response.ok     : 응답 성공 여부 (status 200-299)
    - response.json() : 응답 본문을 JSON으로 파싱
    - catch           : 네트워크 오류 또는 throw된 에러 처리
  */
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다");
        }
        return response.json();
      })
      .then((data) => {
        setPosts(data.slice(0, 10));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  /*
    POST 요청 - 새 게시글 작성
    - e.preventDefault() : 폼 제출 시 페이지 새로고침 방지
    - method: "POST"     : HTTP 메서드를 POST로 지정
    - headers            : 요청 헤더, 메타 정보 (데이터 형식이 뭔지 서버에 알림)
    - body               : 요청 본문, 실제 데이터 (제목, 내용 등을 JSON.stringify로 문자열 변환)
    - 성공 시             : 새 게시글을 목록 맨 앞에 추가
  */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle,
        body: newBody,
        userId: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPosts([data, ...posts]);
        setNewTitle("");
        setNewBody("");
        setIsSubmitting(false);
        alert("게시글이 작성되었습니다! (ID: " + data.id + ")");
      })
      .catch((err) => {
        setError(err.message);
        setIsSubmitting(false);
      });
  };

  /*
    DELETE 요청 - 게시글 삭제
    - method: "DELETE"  : HTTP 메서드를 DELETE로 지정
    - URL에 postId 포함  : 삭제할 게시글을 특정 (예: /posts/1)
    - filter()          : 삭제된 게시글을 제외한 새 배열 생성
  */
  const handleDelete = (postId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          setPosts(posts.filter((post) => post.id !== postId));
          alert("게시글이 삭제되었습니다!");
        } else {
          throw new Error("삭제에 실패했습니다");
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  /*
    화면 렌더링
    - header  : 페이지 상단 타이틀
    - section : 왼쪽 영역 (게시글 목록, 스크롤 가능)
    - aside   : 오른쪽 영역 (게시글 작성 폼, 고정)
  */
  return (
    <div className="h-screen flex flex-col">
      <header className="px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">API 연동 학습 - JSONPlaceholder</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽: 게시글 목록 */}
        <section className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-semibold mb-4">게시글 목록 (GET)</h2>

          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">데이터를 불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <Card className="border-destructive bg-destructive/10 mb-4">
              <CardContent>
                <p className="text-destructive">에러: {error}</p>
              </CardContent>
            </Card>
          )}

          {/* 게시글 목록 */}
          {!loading && !error && (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <CardContent>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{post.title}</h3>
                        <p className="text-muted-foreground mt-2">
                          {post.body}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="ml-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        삭제
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 오른쪽: 게시글 작성 폼 */}
        <aside className="w-96 border-l bg-muted/30 p-6">
          <Card>
            <CardHeader>
              <CardTitle>새 게시글 작성 (POST)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">제목</label>
                  <Input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="게시글 제목을 입력하세요"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">내용</label>
                  <Textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="게시글 내용을 입력하세요"
                    className="h-32"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "작성 중..." : "게시글 작성"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default App;
