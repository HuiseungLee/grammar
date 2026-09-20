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
