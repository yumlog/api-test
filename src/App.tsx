import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Header, Sidebar, MainLayout } from "@/components/layout";

/*
  타입(Type) 정의
  - TypeScript에서 데이터 구조를 명시
  - API 응답 데이터의 형태를 정의하여 타입 안전성 확보
  - Post: 게시글 (id, title, body, userId)
  - Comment: 댓글 (id, postId, name, email, body)
*/
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

/*
  초기 데이터 fetch (컴포넌트 외부에서 실행)
  - React 19 제한  : useEffect 내에서 동기적 setState 호출 시 경고 발생
  - 해결 방법      : 컴포넌트 외부에서 Promise를 생성하고, useEffect에서 .then()으로 처리
  - 장점          : 컴포넌트 마운트 전에 네트워크 요청 시작 (빠른 초기 로딩)
*/
const initialPostsPromise = fetch(
  "https://jsonplaceholder.typicode.com/posts?_page=1&_limit=10"
).then((res) => res.json());

const initialCommentsPromise = fetch(
  "https://jsonplaceholder.typicode.com/comments"
).then((res) => res.json());

function App() {
  /*
    상태(State) 관리
    - posts        : 게시글 목록
    - loading      : 로딩 상태
    - error        : 에러 메시지
    - newTitle     : 새 게시글 제목 입력값
    - newBody      : 새 게시글 내용 입력값
    - isSubmitting : 폼 제출 중 여부
    - editingPost  : 현재 수정 중인 게시글 (null이면 새 글 작성 모드)
    - selectedPost : 상세 조회할 게시글 (Dialog에 표시)
    - detailLoading: 상세 조회 로딩 상태
    - comments       : 게시글별 댓글 목록 (postId를 key로 사용)
    - commentsLoading: 댓글 로딩 중인 게시글 ID
    - commentCounts  : 게시글별 댓글 개수 (목록에서 표시용)
    - currentPage    : 현재 페이지 번호
    - totalPages     : 전체 페이지 수 (JSONPlaceholder는 게시글 100개 제공)
    - postsPerPage   : 페이지당 게시글 수 (10개)
  */
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<number | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>(
    {},
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(10);
  const postsPerPage = 10;

  /*
    GET 요청 - 게시글 목록 가져오기 (페이지네이션)
    - 쿼리 파라미터  : URL 뒤에 ?key=value 형태로 추가
    - _page          : 페이지 번호
    - _limit         : 페이지당 항목 수
    - 예시           : /posts?_page=1&_limit=10
  */
  const fetchPosts = (page: number, showLoading = true) => {
    if (showLoading) setLoading(true);

    fetch(
      `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${postsPerPage}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다");
        }
        return response.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  /*
    최초 로드 - Promise 처리
    - 컴포넌트 외부에서 시작된 Promise를 .then()으로 처리
    - 빈 의존성 배열 [] : 컴포넌트 마운트 시 한 번만 실행
    - commentCounts    : 전체 댓글을 한 번에 가져와서 게시글별 댓글 수 계산
  */
  useEffect(() => {
    initialPostsPromise.then((data) => {
      setPosts(data);
      setLoading(false);
    });

    initialCommentsPromise.then((commentsData) => {
      const counts: Record<number, number> = {};
      commentsData.forEach((comment: Comment) => {
        counts[comment.postId] = (counts[comment.postId] || 0) + 1;
      });
      setCommentCounts(counts);
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
    PUT 요청 - 게시글 수정
    - method: "PUT"     : HTTP 메서드를 PUT으로 지정
    - URL에 postId 포함  : 수정할 게시글을 특정 (예: /posts/1)
    - headers, body     : POST와 동일하게 수정할 데이터 전송
    - map()             : 해당 게시글만 수정된 데이터로 교체
  */
  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setNewTitle(post.title);
    setNewBody(post.body);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    setIsSubmitting(true);

    fetch(`https://jsonplaceholder.typicode.com/posts/${editingPost.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editingPost.id,
        title: newTitle,
        body: newBody,
        userId: editingPost.userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPosts(posts.map((post) => (post.id === data.id ? data : post)));
        setNewTitle("");
        setNewBody("");
        setEditingPost(null);
        setIsSubmitting(false);
        alert("게시글이 수정되었습니다!");
      })
      .catch((err) => {
        setError(err.message);
        setIsSubmitting(false);
      });
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setNewTitle("");
    setNewBody("");
  };

  /*
    GET 요청 - 게시글 상세 조회
    - URL에 postId 포함  : 특정 게시글 하나만 조회 (예: /posts/1)
    - 목록 조회와 다르게 단일 객체를 반환
  */
  const handleViewDetail = (postId: number) => {
    setDetailLoading(true);

    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("게시글을 불러오는데 실패했습니다");
        }
        return response.json();
      })
      .then((data) => {
        setSelectedPost(data);
        setDetailLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setDetailLoading(false);
      });
  };

  /*
    GET 요청 - 댓글 목록 조회 (관계형 데이터)
    - URL: /posts/{postId}/comments : 특정 게시글의 댓글만 조회
    - 관계형 데이터: 게시글(Post) → 댓글(Comment) 연결
    - comments 객체에 postId를 key로 저장
  */
  const handleLoadComments = (postId: number) => {
    if (comments[postId]) return;

    setCommentsLoading(postId);

    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("댓글을 불러오는데 실패했습니다");
        }
        return response.json();
      })
      .then((data) => {
        setComments((prev) => ({ ...prev, [postId]: data }));
        setCommentsLoading(null);
      })
      .catch((err) => {
        setError(err.message);
        setCommentsLoading(null);
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
    - MainLayout : 전체 레이아웃 구조 (header, main, sidebar)
    - Header     : 페이지 상단 타이틀
    - Sidebar    : 오른쪽 영역 (게시글 작성 폼, 고정)
  */
  return (
    <MainLayout
      header={<Header title="API 연동 학습 - JSONPlaceholder" />}
      main={
        <>
          <div className="p-6 pb-0">
            <h2 className="text-xl font-semibold mb-4">게시글 목록 (GET)</h2>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">데이터를 불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="px-6">
              <Card className="border-destructive bg-destructive/10 mb-4">
                <CardContent>
                  <p className="text-destructive">에러: {error}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 게시글 목록 */}
          {!loading && !error && (
            <>
              <div className="flex-1 overflow-y-auto px-6">
                <div className="grid grid-cols-2 gap-4">
                  {posts.map((post) => (
                    <Card
                      key={post.id}
                      className="transition-colors cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetail(post.id)}
                    >
                      <CardContent>
                        <h3 className="font-medium line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          댓글 {commentCounts[post.id] || 0}개
                        </p>
                        {/*
                          이벤트 전파(Propagation) 방지
                          - 부모 Card의 onClick과 버튼 onClick이 충돌하는 것을 방지
                          - stopPropagation(): 클릭 이벤트가 부모로 전파되는 것을 막음
                        */}
                        <div
                          className="flex gap-2 mt-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(post)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(post.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/*
                페이지네이션 (고정)
                - 페이지 변경 시 fetchPosts(page) 호출하여 해당 페이지 데이터 로드
                - disabled 속성으로 첫 페이지/마지막 페이지에서 버튼 비활성화
              */}
              <div className="p-4 border-t bg-background">
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      fetchPosts(newPage);
                    }}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCurrentPage(page);
                            fetchPosts(page);
                          }}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      ),
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      fetchPosts(newPage);
                    }}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  GET /posts?_page={currentPage}&_limit={postsPerPage}
                </p>
              </div>
            </>
          )}
        </>
      }
      sidebar={
        <Sidebar>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingPost ? "게시글 수정 (PUT)" : "새 게시글 작성 (POST)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={editingPost ? handleUpdate : handleSubmit}
                className="space-y-4"
              >
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
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting
                      ? editingPost
                        ? "수정 중..."
                        : "작성 중..."
                      : editingPost
                        ? "게시글 수정"
                        : "게시글 작성"}
                  </Button>
                  {editingPost && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      취소
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </Sidebar>
      }
    >

      {/* 게시글 상세 조회 Dialog */}
      <Dialog
        open={selectedPost !== null || detailLoading}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              게시글 상세 (GET /posts/{selectedPost?.id})
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <p className="text-muted-foreground">불러오는 중...</p>
          ) : (
            selectedPost && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">제목</p>
                  <p className="font-medium">{selectedPost.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">내용</p>
                  <p>{selectedPost.body}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">작성자 ID</p>
                  <p>{selectedPost.userId}</p>
                </div>

                {/* 댓글 아코디언 */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="comments">
                    <AccordionTrigger
                      onClick={() => handleLoadComments(selectedPost.id)}
                      className="text-sm"
                    >
                      댓글 보기 ({commentCounts[selectedPost.id] || 0}개)
                    </AccordionTrigger>
                    <AccordionContent>
                      {commentsLoading === selectedPost.id ? (
                        <p className="text-sm text-muted-foreground py-2">
                          댓글 불러오는 중...
                        </p>
                      ) : comments[selectedPost.id] ? (
                        <div className="max-h-60 overflow-y-auto space-y-3 pt-2">
                          {comments[selectedPost.id].map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-muted/50 rounded-lg p-3"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <p className="font-medium text-sm">
                                  {comment.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {comment.email}
                                </p>
                              </div>
                              <p className="text-sm">{comment.body}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

export default App;
