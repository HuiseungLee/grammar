import { FilePlus2, Home, LogOut, MessageCircleQuestion, PenLine } from "lucide-react";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { TeacherQuestionInbox, type TeacherQuestionThread } from "@/components/teacher-question-inbox";
import { requireGrammarEditor } from "@/lib/editor-access";
import { getGrammarQuestionStats, getGrammarQuestionThreads } from "@/lib/grammar-comments";
import { getOwnedLessons, getPublishedLessons } from "@/lib/grammar-data";

export const dynamic = "force-dynamic";

export default async function StudioQuestionsPage() {
  const user = await requireGrammarEditor("/studio/questions");
  const [lessons, publishedLessons, threads, questionStats] = await Promise.all([
    getOwnedLessons(user.userId),
    getPublishedLessons(),
    getGrammarQuestionThreads(),
    getGrammarQuestionStats(),
  ]);
  const lessonTitles = new Map(publishedLessons.map((lesson) => [lesson.slug, lesson.title]));
  const inboxThreads: TeacherQuestionThread[] = threads.map((thread) => ({
    ...thread,
    lessonTitle: lessonTitles.get(thread.question.lessonSlug) ?? thread.question.lessonSlug,
  }));

  return (
    <main className="studio-page">
      <header className="studio-header">
        <a className="brand" href="/"><span>수니기는</span> 문법시간</a>
        <div className="studio-identity">
          <span>{user.displayName}</span>
          {user.authKind === "chatgpt" ? (
            <a href={chatGPTSignOutPath("/")} target="_top"><LogOut aria-hidden="true" size={15} /> 로그아웃</a>
          ) : (
            <form action="/api/studio/logout" method="post"><button type="submit"><LogOut aria-hidden="true" size={15} /> 로그아웃</button></form>
          )}
        </div>
      </header>
      <div className="studio-shell">
        <aside className="studio-sidebar">
          <div className="studio-sidebar-top">
            <div><p>TEACHER STUDIO</p><h1>문법 편집실</h1></div>
            <a className="new-lesson-link" href="/studio"><FilePlus2 aria-hidden="true" /> 새 자료</a>
          </div>
          <nav aria-label="편집실 메뉴와 내 문법 자료">
            <a className="studio-question-link active" href="/studio/questions">
              <MessageCircleQuestion aria-hidden="true" />
              <span><strong>질문 관리</strong><small>{questionStats.unanswered > 0 ? `답변 필요 ${questionStats.unanswered}개` : "새 질문 없음"}</small></span>
              {questionStats.unanswered > 0 ? <b aria-label={`답변할 질문 ${questionStats.unanswered}개`}>{questionStats.unanswered > 99 ? "99+" : questionStats.unanswered}</b> : null}
            </a>
            {lessons.length > 0 ? lessons.map((lesson) => (
              <a href={`/studio?edit=${lesson.id}`} key={lesson.id}>
                <span className={`status-dot ${lesson.status}`} aria-hidden="true" />
                <span><strong>{lesson.title || "제목 없는 자료"}</strong><small>{lesson.domain} · {lesson.status === "published" ? "출판됨" : "초안"}</small></span>
              </a>
            )) : <div className="studio-empty"><PenLine aria-hidden="true" /><strong>첫 자료를 만들어 보세요.</strong><span>새 자료를 출판하면 학생 질문도 이곳에서 관리할 수 있습니다.</span></div>}
          </nav>
          <a className="studio-home-link" href="/"><Home aria-hidden="true" size={16} /> 학습 사이트 보기</a>
        </aside>
        <div className="studio-workspace teacher-inbox-workspace"><TeacherQuestionInbox initialThreads={inboxThreads} /></div>
      </div>
    </main>
  );
}
