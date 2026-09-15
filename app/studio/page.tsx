import { FilePlus2, Home, LogOut, PenLine } from "lucide-react";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { StudioEditor } from "@/components/studio-editor";
import { requireGrammarEditor } from "@/lib/editor-access";
import { getOwnedLessons } from "@/lib/grammar-data";

export const dynamic = "force-dynamic";

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ edit?: string | string[] }> }) {
  const user = await requireGrammarEditor("/studio");
  const [params, lessons] = await Promise.all([searchParams, getOwnedLessons(user.userId)]);
  const selectedId = Number(firstParam(params.edit));
  const selected = Number.isInteger(selectedId) ? lessons.find((lesson) => lesson.id === selectedId) : undefined;

  return (
    <main className="studio-page">
      <header className="studio-header">
        <a className="brand" href="/"><span>수니기는</span> 문법시간</a>
        <div className="studio-identity">
          <span>{user.displayName}</span>
          {user.authKind === "chatgpt" ? (
            <a href={chatGPTSignOutPath("/")} target="_top"><LogOut aria-hidden="true" size={15} /> 로그아웃</a>
          ) : (
            <form action="/api/studio/logout" method="post">
              <button type="submit"><LogOut aria-hidden="true" size={15} /> 로그아웃</button>
            </form>
          )}
        </div>
      </header>
      <div className="studio-shell">
        <aside className="studio-sidebar">
          <div className="studio-sidebar-top">
            <div><p>TEACHER STUDIO</p><h1>문법 편집실</h1></div>
            <a className="new-lesson-link" href="/studio"><FilePlus2 aria-hidden="true" /> 새 자료</a>
          </div>
          <nav aria-label="내 문법 자료">
            {lessons.length > 0 ? lessons.map((lesson) => (
              <a className={selected?.id === lesson.id ? "active" : ""} href={`/studio?edit=${lesson.id}`} key={lesson.id}>
                <span className={`status-dot ${lesson.status}`} aria-hidden="true" />
                <span><strong>{lesson.title || "제목 없는 자료"}</strong><small>{lesson.domain} · {lesson.status === "published" ? "출판됨" : "초안"}</small></span>
              </a>
            )) : <div className="studio-empty"><PenLine aria-hidden="true" /><strong>첫 자료를 만들어 보세요.</strong><span>구조화된 항목을 채우면 학습 화면이 자동으로 만들어집니다.</span></div>}
          </nav>
          <a className="studio-home-link" href="/"><Home aria-hidden="true" size={16} /> 학습 사이트 보기</a>
        </aside>
        <StudioEditor key={selected ? `lesson-${selected.id}` : "new-lesson"} initialLesson={selected} />
      </div>
    </main>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
