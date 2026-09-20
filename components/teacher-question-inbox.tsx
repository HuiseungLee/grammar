"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, Loader2, MessageCircleQuestion, Send, Trash2 } from "lucide-react";
import type { GrammarComment, GrammarQuestionThread } from "@/lib/grammar-comments";

export type TeacherQuestionThread = GrammarQuestionThread & { lessonTitle: string };

export function TeacherQuestionInbox({ initialThreads }: { initialThreads: TeacherQuestionThread[] }) {
  const [threads, setThreads] = useState(initialThreads);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const unanswered = threads.filter((thread) => thread.replies.length === 0).length;

  async function submitReply(event: FormEvent, thread: TeacherQuestionThread) {
    event.preventDefault();
    if (!replyBody.trim()) return;
    setBusyId(thread.question.id);
    setMessage("");
    try {
      const response = await fetch(`/api/lessons/${thread.question.lessonSlug}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: replyBody, parentId: thread.question.id }),
      });
      const result = await response.json().catch(() => ({})) as GrammarComment & { error?: string };
      if (!response.ok || !result.id) throw new Error(result.error || "답변을 등록하지 못했습니다.");
      setThreads((current) => reorderThreads(current.map((item) => item.question.id === thread.question.id ? { ...item, replies: [...item.replies, result] } : item)));
      setReplyBody("");
      setReplyTo(null);
      setMessage("교사 답변을 등록했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "답변을 등록하지 못했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeComment(comment: GrammarComment) {
    const question = comment.parentId === null;
    if (!window.confirm(question ? "이 질문과 연결된 답변을 함께 삭제할까요?" : "이 답변을 삭제할까요?")) return;
    setBusyId(comment.id);
    setMessage("");
    try {
      const response = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || "삭제하지 못했습니다.");
      setThreads((current) => question
        ? current.filter((thread) => thread.question.id !== comment.id)
        : reorderThreads(current.map((thread) => ({ ...thread, replies: thread.replies.filter((reply) => reply.id !== comment.id) }))));
      setMessage("삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "삭제하지 못했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="teacher-inbox">
      <header className="teacher-inbox-head">
        <div><p>STUDENT Q&amp;A</p><h1>질문 관리</h1><span>학생 질문을 미답변 우선으로 확인하고 이 화면에서 바로 답변합니다.</span></div>
        <div className="teacher-inbox-stats"><span><b>{unanswered}</b>답변 필요</span><span><b>{threads.length}</b>전체 질문</span></div>
      </header>

      {message ? <p className="teacher-inbox-message" role="status">{message}</p> : null}

      <div className="teacher-question-list">
        {threads.map((thread) => {
          const needsReply = thread.replies.length === 0;
          return (
            <article className={`teacher-question-card ${needsReply ? "needs-reply" : "answered"}`} key={thread.question.id}>
              <div className="teacher-question-top">
                <span className={`teacher-question-status ${needsReply ? "new" : "done"}`}>{needsReply ? "답변 필요" : "답변 완료"}</span>
                <a href={`/lesson/${thread.question.lessonSlug}#qna`} target="_blank" rel="noreferrer">{thread.lessonTitle}<ArrowUpRight aria-hidden="true" /></a>
                <time dateTime={thread.question.createdAt}>{formatDate(thread.question.createdAt)}</time>
              </div>
              <div className="teacher-question-body">
                <div className="teacher-question-author"><MessageCircleQuestion aria-hidden="true" /><b>{thread.question.authorName}</b><span>학생 질문</span><button type="button" disabled={busyId !== null} onClick={() => void removeComment(thread.question)}><Trash2 aria-hidden="true" /> 삭제</button></div>
                <p>{thread.question.body}</p>
              </div>

              {thread.replies.map((reply) => (
                <div className="teacher-answer" key={reply.id}>
                  <div><b>교사 답변</b><time dateTime={reply.createdAt}>{formatDate(reply.createdAt)}</time><button type="button" disabled={busyId !== null} onClick={() => void removeComment(reply)}><Trash2 aria-hidden="true" /> 삭제</button></div>
                  <p>{reply.body}</p>
                </div>
              ))}

              {replyTo === thread.question.id ? (
                <form className="teacher-answer-form" onSubmit={(event) => void submitReply(event, thread)}>
                  <label className="sr-only" htmlFor={`teacher-reply-${thread.question.id}`}>교사 답변</label>
                  <textarea id={`teacher-reply-${thread.question.id}`} autoFocus required maxLength={2000} value={replyBody} onChange={(event) => setReplyBody(event.target.value)} placeholder={`${thread.question.authorName} 학생에게 답변해 주세요.`} />
                  <div><button type="button" onClick={() => { setReplyTo(null); setReplyBody(""); }}>취소</button><button type="submit" className="primary" disabled={busyId !== null || !replyBody.trim()}>{busyId === thread.question.id ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />} 답변 등록</button></div>
                </form>
              ) : (
                <button className="teacher-answer-open" type="button" onClick={() => { setReplyTo(thread.question.id); setReplyBody(""); }}>{needsReply ? "바로 답변하기" : "답변 추가하기"}</button>
              )}
            </article>
          );
        })}
        {!threads.length ? <div className="teacher-inbox-empty"><MessageCircleQuestion aria-hidden="true" /><strong>아직 등록된 학생 질문이 없습니다.</strong><span>새 질문이 올라오면 이곳에 최신순으로 표시됩니다.</span></div> : null}
      </div>
    </section>
  );
}

function reorderThreads(threads: TeacherQuestionThread[]) {
  return [...threads].sort((left, right) => {
    const answerOrder = Number(left.replies.length > 0) - Number(right.replies.length > 0);
    return answerOrder || right.question.createdAt.localeCompare(left.question.createdAt) || right.question.id - left.question.id;
  });
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}
