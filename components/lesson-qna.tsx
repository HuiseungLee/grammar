"use client";

import { FormEvent, useState } from "react";
import { Loader2, MessageCircleQuestion, Send, Trash2 } from "lucide-react";
import type { GrammarComment } from "@/lib/grammar-comments";
import type { SharedUserRole } from "@/lib/supabase-auth";

type QnaUser = {
  id: string;
  role: SharedUserRole;
  displayName: string;
} | null;

export function LessonQna({ lessonSlug, initialComments, user }: { lessonSlug: string; initialComments: GrammarComment[]; user: QnaUser }) {
  const [comments, setComments] = useState(initialComments);
  const [question, setQuestion] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const questions = comments.filter((comment) => comment.parentId === null);

  async function refreshComments() {
    const response = await fetch(`/api/lessons/${lessonSlug}/comments`, { cache: "no-store" });
    const result = await response.json().catch(() => []);
    if (!response.ok || !Array.isArray(result)) throw new Error("Q&A를 다시 불러오지 못했습니다.");
    setComments(result as GrammarComment[]);
  }

  async function submitQuestion(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    if (await submitComment(question, null)) setQuestion("");
  }

  async function submitReply(event: FormEvent, parentId: number) {
    event.preventDefault();
    if (!replyBody.trim()) return;
    if (await submitComment(replyBody, parentId)) {
      setReplyBody("");
      setReplyTo(null);
    }
  }

  async function submitComment(body: string, parentId: number | null) {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/lessons/${lessonSlug}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body, parentId }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Q&A를 등록하지 못했습니다.");
      await refreshComments();
      setMessage(parentId === null ? "질문을 등록했습니다." : "교사 답변을 등록했습니다.");
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Q&A를 등록하지 못했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function removeComment(comment: GrammarComment) {
    const label = comment.parentId === null ? "이 질문과 연결된 답변을 함께 삭제할까요?" : "이 답변을 삭제할까요?";
    if (!window.confirm(label)) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Q&A를 삭제하지 못했습니다.");
      await refreshComments();
      setMessage("삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Q&A를 삭제하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qna">
      <div className="qna-heading"><MessageCircleQuestion aria-hidden="true" /><div><h2>질문하고 함께 이해해요.</h2><p>학생이 질문을 남기면 교사가 이 자료에서 바로 답변합니다.</p></div></div>

      {user?.role === "student" ? (
        <form className="qna-form" onSubmit={submitQuestion}>
          <label className="sr-only" htmlFor="qna-question">교사에게 질문하기</label>
          <textarea id="qna-question" required maxLength={2000} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="이 자료에서 궁금한 점을 질문해 주세요." />
          <button type="submit" disabled={loading || !question.trim()}>{loading ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />} 질문 등록</button>
        </form>
      ) : user?.role === "teacher" ? (
        <p className="qna-teacher-note">학생 질문 아래의 ‘답변하기’를 눌러 교사 답변을 등록할 수 있습니다.</p>
      ) : (
        <a className="qna-login" href={`/login?returnTo=${encodeURIComponent(`/lesson/${lessonSlug}#qna`)}`}>로그인하고 질문하기</a>
      )}

      {message ? <p className="qna-message" role="status">{message}</p> : null}

      <div className="qna-list">
        {questions.map((questionItem) => (
          <article className="qna-item" key={questionItem.id}>
            <div className="qna-meta">
              <b className={`role-badge role-${questionItem.authorRole}`}>{questionItem.authorRole === "teacher" ? "교사" : "학생"}</b>
              <span>{questionItem.authorName}</span>
              <time dateTime={questionItem.createdAt}>{formatDate(questionItem.createdAt)}</time>
              {user && (user.role === "teacher" || user.id === questionItem.userId) ? <button type="button" disabled={loading} onClick={() => void removeComment(questionItem)}><Trash2 aria-hidden="true" /> 삭제</button> : null}
            </div>
            <p>{questionItem.body}</p>

            {comments.filter((comment) => comment.parentId === questionItem.id).map((reply) => (
              <div className="qna-reply" key={reply.id}>
                <div className="qna-meta">
                  <b className="role-badge role-teacher">교사 답변</b>
                  <span>{reply.authorName}</span>
                  <time dateTime={reply.createdAt}>{formatDate(reply.createdAt)}</time>
                  {user?.role === "teacher" ? <button type="button" disabled={loading} onClick={() => void removeComment(reply)}><Trash2 aria-hidden="true" /> 삭제</button> : null}
                </div>
                <p>{reply.body}</p>
              </div>
            ))}

            {user?.role === "teacher" ? replyTo === questionItem.id ? (
              <form className="qna-reply-form" onSubmit={(event) => void submitReply(event, questionItem.id)}>
                <label className="sr-only" htmlFor={`qna-reply-${questionItem.id}`}>교사 답변</label>
                <textarea id={`qna-reply-${questionItem.id}`} required maxLength={2000} autoFocus value={replyBody} onChange={(event) => setReplyBody(event.target.value)} placeholder={`${questionItem.authorName} 학생에게 답변해 주세요.`} />
                <div><button type="button" onClick={() => { setReplyTo(null); setReplyBody(""); }}>취소</button><button type="submit" className="primary" disabled={loading || !replyBody.trim()}>{loading ? "등록 중…" : "답변 등록"}</button></div>
              </form>
            ) : <button type="button" className="qna-reply-button" onClick={() => { setReplyTo(questionItem.id); setReplyBody(""); }}>답변하기</button> : null}
          </article>
        ))}
        {!questions.length ? <p className="qna-empty">아직 등록된 질문이 없습니다. 첫 질문을 남겨 보세요.</p> : null}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}
