import { env } from "cloudflare:workers";
import type { SharedUserRole } from "./supabase-auth";

export type GrammarComment = {
  id: number;
  lessonSlug: string;
  parentId: number | null;
  userId: string;
  authorRole: SharedUserRole;
  authorName: string;
  body: string;
  createdAt: string;
};

export type GrammarQuestionThread = {
  question: GrammarComment;
  replies: GrammarComment[];
};

export type GrammarQuestionStats = {
  total: number;
  unanswered: number;
};

type CommentRow = {
  id: number;
  lesson_slug: string;
  parent_id: number | null;
  user_id: string;
  author_role: SharedUserRole;
  author_name: string;
  body: string;
  created_at: string;
};

function database(): D1Database {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

function rowToComment(row: CommentRow): GrammarComment {
  return {
    id: row.id,
    lessonSlug: row.lesson_slug,
    parentId: row.parent_id,
    userId: row.user_id,
    authorRole: row.author_role,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function getLessonComments(lessonSlug: string): Promise<GrammarComment[]> {
  try {
    const result = await database().prepare(
      `SELECT id, lesson_slug, parent_id, user_id, author_role, author_name, body, created_at
       FROM grammar_comments WHERE lesson_slug = ? ORDER BY created_at ASC, id ASC`,
    ).bind(lessonSlug).all<CommentRow>();
    return result.results.map(rowToComment);
  } catch (error) {
    console.error("Unable to load grammar Q&A", error);
    return [];
  }
}

export async function getGrammarQuestionThreads(limit = 100): Promise<GrammarQuestionThread[]> {
  try {
    const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit)));
    const result = await database().prepare(
      `WITH recent_questions AS (
         SELECT id FROM grammar_comments
         WHERE parent_id IS NULL AND author_role = 'student'
         ORDER BY created_at DESC, id DESC
         LIMIT ?
       )
       SELECT id, lesson_slug, parent_id, user_id, author_role, author_name, body, created_at
       FROM grammar_comments
       WHERE id IN (SELECT id FROM recent_questions)
          OR parent_id IN (SELECT id FROM recent_questions)
       ORDER BY created_at ASC, id ASC`,
    ).bind(safeLimit).all<CommentRow>();

    const comments = result.results.map(rowToComment);
    const repliesByQuestion = new Map<number, GrammarComment[]>();
    for (const comment of comments) {
      if (comment.parentId === null) continue;
      const replies = repliesByQuestion.get(comment.parentId) ?? [];
      replies.push(comment);
      repliesByQuestion.set(comment.parentId, replies);
    }

    return comments
      .filter((comment) => comment.parentId === null && comment.authorRole === "student")
      .map((question) => ({ question, replies: repliesByQuestion.get(question.id) ?? [] }))
      .sort((left, right) => {
        const answerOrder = Number(left.replies.length > 0) - Number(right.replies.length > 0);
        return answerOrder || right.question.createdAt.localeCompare(left.question.createdAt) || right.question.id - left.question.id;
      });
  } catch (error) {
    console.error("Unable to load the teacher Q&A inbox", error);
    return [];
  }
}

export async function getGrammarQuestionStats(): Promise<GrammarQuestionStats> {
  try {
    const row = await database().prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN NOT EXISTS (
           SELECT 1 FROM grammar_comments reply WHERE reply.parent_id = question.id
         ) THEN 1 ELSE 0 END) AS unanswered
       FROM grammar_comments question
       WHERE question.parent_id IS NULL AND question.author_role = 'student'`,
    ).first<{ total: number; unanswered: number | null }>();
    return { total: Number(row?.total ?? 0), unanswered: Number(row?.unanswered ?? 0) };
  } catch (error) {
    console.error("Unable to load grammar Q&A counts", error);
    return { total: 0, unanswered: 0 };
  }
}

export async function getGrammarComment(id: number): Promise<GrammarComment | null> {
  const row = await database().prepare(
    `SELECT id, lesson_slug, parent_id, user_id, author_role, author_name, body, created_at
     FROM grammar_comments WHERE id = ? LIMIT 1`,
  ).bind(id).first<CommentRow>();
  return row ? rowToComment(row) : null;
}

export async function createGrammarComment(input: {
  lessonSlug: string;
  parentId: number | null;
  userId: string;
  authorRole: SharedUserRole;
  authorName: string;
  body: string;
}): Promise<GrammarComment> {
  const createdAt = new Date().toISOString();
  const result = await database().prepare(
    `INSERT INTO grammar_comments
     (lesson_slug, parent_id, user_id, author_role, author_name, body, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    input.lessonSlug,
    input.parentId,
    input.userId,
    input.authorRole,
    input.authorName,
    input.body,
    createdAt,
  ).run();
  const created = await getGrammarComment(Number(result.meta.last_row_id));
  if (!created) throw new Error("등록한 Q&A를 다시 불러오지 못했습니다.");
  return created;
}

export async function deleteGrammarComment(id: number): Promise<void> {
  const db = database();
  await db.batch([
    db.prepare("DELETE FROM grammar_comments WHERE parent_id = ?").bind(id),
    db.prepare("DELETE FROM grammar_comments WHERE id = ?").bind(id),
  ]);
}
