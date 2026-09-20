import { NextResponse } from "next/server";
import {
  createGrammarComment,
  getGrammarComment,
  getLessonComments,
} from "@/lib/grammar-comments";
import { getLessonBySlug } from "@/lib/grammar-data";
import { getSharedUserFromRequest } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!isValidSlug(slug) || !(await getLessonBySlug(slug))) {
    return NextResponse.json({ error: "학습 자료를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json(await getLessonComments(slug));
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getSharedUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "로그인 후 질문하거나 답변할 수 있습니다." }, { status: 401 });

  const { slug } = await context.params;
  if (!isValidSlug(slug) || !(await getLessonBySlug(slug))) {
    return NextResponse.json({ error: "학습 자료를 찾을 수 없습니다." }, { status: 404 });
  }

  let input: { body?: unknown; parentId?: unknown };
  try {
    input = await request.json() as { body?: unknown; parentId?: unknown };
  } catch {
    return NextResponse.json({ error: "등록할 내용을 읽지 못했습니다." }, { status: 400 });
  }

  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!body || body.length > 2000) {
    return NextResponse.json({ error: "내용은 1자 이상 2,000자 이하로 입력해 주세요." }, { status: 400 });
  }

  const parentId = input.parentId === null || input.parentId === undefined ? null : Number(input.parentId);
  if (parentId !== null && (!Number.isInteger(parentId) || parentId < 1)) {
    return NextResponse.json({ error: "답변할 질문 번호가 올바르지 않습니다." }, { status: 400 });
  }

  if (parentId === null && user.role !== "student") {
    return NextResponse.json({ error: "새 질문은 학생 계정으로 등록할 수 있습니다." }, { status: 403 });
  }
  if (parentId !== null && user.role !== "teacher") {
    return NextResponse.json({ error: "교사 계정만 질문에 답변할 수 있습니다." }, { status: 403 });
  }

  if (parentId !== null) {
    const parent = await getGrammarComment(parentId);
    if (!parent || parent.lessonSlug !== slug || parent.parentId !== null || parent.authorRole !== "student") {
      return NextResponse.json({ error: "답변할 학생 질문을 찾을 수 없습니다." }, { status: 404 });
    }
  }

  try {
    const comment = await createGrammarComment({
      lessonSlug: slug,
      parentId,
      userId: user.id,
      authorRole: user.role,
      authorName: user.role === "teacher" ? "교사" : user.nickname || user.realName || user.displayName || "학생",
      body,
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Unable to create grammar Q&A", error);
    return NextResponse.json({ error: "Q&A를 등록하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}

function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 100;
}
