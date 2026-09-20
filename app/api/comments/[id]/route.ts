import { NextResponse } from "next/server";
import {
  deleteGrammarComment,
  getGrammarComment,
} from "@/lib/grammar-comments";
import { getSharedUserFromRequest } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getSharedUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Q&A 번호가 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const comment = await getGrammarComment(id);
    if (!comment) return NextResponse.json({ error: "Q&A를 찾을 수 없습니다." }, { status: 404 });
    if (user.role !== "teacher" && comment.userId !== user.id) {
      return NextResponse.json({ error: "본인이 작성한 질문만 삭제할 수 있습니다." }, { status: 403 });
    }
    await deleteGrammarComment(id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Unable to delete grammar Q&A", error);
    return NextResponse.json({ error: "Q&A를 삭제하지 못했습니다." }, { status: 500 });
  }
}
