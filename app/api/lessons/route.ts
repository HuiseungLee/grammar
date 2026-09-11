import { NextResponse } from "next/server";
import { getGrammarEditorUser } from "@/lib/editor-access";
import { BUILT_IN_LESSONS, saveLesson } from "@/lib/grammar-data";
import { GRAMMAR_DOMAINS, SCHOOL_BANDS, type LessonInput } from "@/lib/lesson-types";

export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 100_000;
const MAX_STEPS = 12;
const MAX_EXAMPLES = 12;
const MAX_CHOICES = 6;

export async function POST(request: Request) {
  const user = await getGrammarEditorUser();
  if (!user) return NextResponse.json({ error: "편집실에 로그인해 주세요." }, { status: 401 });

  let raw: unknown;
  try {
    const body = await request.text();
    if (body.length > MAX_BODY_LENGTH) return NextResponse.json({ error: "저장할 내용이 너무 큽니다." }, { status: 413 });
    raw = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "저장할 내용을 읽지 못했습니다." }, { status: 400 });
  }

  const parsed = parseLessonInput(raw);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const lesson = await saveLesson(user.userId, parsed.input);
    return NextResponse.json({ lesson });
  } catch (error) {
    const internalMessage = error instanceof Error ? error.message : "Unknown lesson save error";
    console.error("Unable to save grammar lesson", error);
    const duplicate = /unique|constraint/i.test(internalMessage);
    return NextResponse.json(
      { error: duplicate ? "이미 사용 중인 주소입니다. 자료 주소를 바꾸어 주세요." : "자료를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: duplicate ? 409 : 500 },
    );
  }
}

function parseLessonInput(value: unknown): { input: LessonInput } | { error: string } {
  const input = asRecord(value);
  if (!input) return { error: "저장할 내용이 없습니다." };
  if (input.id !== undefined && (!Number.isInteger(input.id) || (input.id as number) < 1)) return { error: "자료 번호가 올바르지 않습니다." };
  if (input.status !== "draft" && input.status !== "published") return { error: "출판 상태가 올바르지 않습니다." };
  if (!isBoundedString(input.slug, 100)) return { error: "자료 주소는 100자 이내로 입력해 주세요." };
  if (!isBoundedString(input.title, 140)) return { error: "제목은 140자 이내로 입력해 주세요." };
  if (!isBoundedString(input.summary, 320)) return { error: "한 줄 요약은 320자 이내로 입력해 주세요." };
  if (!isBoundedString(input.curriculumCode, 100)) return { error: "교육과정 메모는 100자 이내로 입력해 주세요." };
  if (typeof input.domain !== "string" || !GRAMMAR_DOMAINS.includes(input.domain as (typeof GRAMMAR_DOMAINS)[number])) return { error: "문법 영역을 선택해 주세요." };
  if (typeof input.schoolBand !== "string" || !SCHOOL_BANDS.includes(input.schoolBand as (typeof SCHOOL_BANDS)[number])) return { error: "학교급을 선택해 주세요." };

  let slug = input.slug.trim();
  if (!slug && input.status === "draft") slug = `draft-${crypto.randomUUID().slice(0, 12)}`;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: "자료 주소는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다." };
  if (BUILT_IN_LESSONS.some((lesson) => lesson.slug === slug)) return { error: "기본 학습 자료와 같은 주소는 사용할 수 없습니다." };

  const content = asRecord(input.content);
  if (!content) return { error: "학습 내용을 확인해 주세요." };
  if (!isBoundedString(content.opening, 4_000)) return { error: "수업을 여는 문장은 4,000자 이내로 입력해 주세요." };
  if (!isBoundedString(content.openingNote, 2_000)) return { error: "첫 관찰은 2,000자 이내로 입력해 주세요." };
  if (!isBoundedString(content.concept, 10_000)) return { error: "핵심 개념은 10,000자 이내로 입력해 주세요." };
  if (!isBoundedString(content.analysisTitle, 200)) return { error: "분석 제목은 200자 이내로 입력해 주세요." };
  if (!isBoundedString(content.comparison, 6_000)) return { error: "헷갈림 비교는 6,000자 이내로 입력해 주세요." };

  if (!Array.isArray(content.analysisSteps) || content.analysisSteps.length > MAX_STEPS || !content.analysisSteps.every((step) => isBoundedString(step, 1_000))) {
    return { error: "분석 단계는 12개 이하, 단계마다 1,000자 이내로 입력해 주세요." };
  }
  if (!Array.isArray(content.examples) || content.examples.length > MAX_EXAMPLES || !content.examples.every(isLessonExample)) {
    return { error: "예문은 12개 이하로 입력하고 문장과 설명의 형식을 확인해 주세요." };
  }

  const practice = asRecord(content.practice);
  if (!practice) return { error: "확인 문제의 형식을 확인해 주세요." };
  if (!isBoundedString(practice.prompt, 2_000)) return { error: "확인 문제는 2,000자 이내로 입력해 주세요." };
  if (!Array.isArray(practice.choices) || practice.choices.length > MAX_CHOICES || !practice.choices.every((choice) => isBoundedString(choice, 500))) {
    return { error: "선택지는 6개 이하, 선택지마다 500자 이내로 입력해 주세요." };
  }
  if (!Number.isInteger(practice.answerIndex) || (practice.answerIndex as number) < 0 || (practice.choices.length > 0 && (practice.answerIndex as number) >= practice.choices.length)) {
    return { error: "정답 선택지 번호가 올바르지 않습니다." };
  }
  if (!isBoundedString(practice.explanation, 4_000)) return { error: "정답 풀이는 4,000자 이내로 입력해 주세요." };

  const analysisSteps = content.analysisSteps as string[];
  const examples = content.examples as Array<{ sentence: string; note: string }>;
  const choices = practice.choices as string[];
  const answerIndex = practice.answerIndex as number;

  if (input.status === "published") {
    if (!input.title.trim()) return { error: "출판하려면 제목을 입력해 주세요." };
    if (!input.summary.trim()) return { error: "출판하려면 한 줄 요약을 입력해 주세요." };
    if (!content.opening.trim()) return { error: "출판하려면 수업을 여는 문장을 입력해 주세요." };
    if (!content.concept.trim()) return { error: "출판하려면 핵심 개념을 입력해 주세요." };
    if (!analysisSteps.some((step) => step.trim())) return { error: "출판하려면 분석 단계를 하나 이상 입력해 주세요." };
    if (!examples.some((example) => example.sentence.trim())) return { error: "출판하려면 예문을 하나 이상 입력해 주세요." };
    if (!practice.prompt.trim()) return { error: "출판하려면 확인 문제를 입력해 주세요." };
    if (choices.length < 2 || !choices.every((choice) => choice.trim())) return { error: "출판하려면 선택지를 두 개 이상 모두 입력해 주세요." };
    if (answerIndex >= choices.length) return { error: "출판하려면 올바른 정답 선택지를 지정해 주세요." };
    if (!practice.explanation.trim()) return { error: "출판하려면 정답 풀이를 입력해 주세요." };
  }

  return {
    input: {
      id: input.id as number | undefined,
      slug,
      title: input.title.trim(),
      summary: input.summary.trim(),
      schoolBand: input.schoolBand,
      domain: input.domain,
      curriculumCode: input.curriculumCode.trim(),
      status: input.status,
      content: {
        opening: content.opening,
        openingNote: content.openingNote,
        concept: content.concept,
        analysisTitle: content.analysisTitle,
        analysisSteps,
        examples,
        comparison: content.comparison,
        practice: {
          prompt: practice.prompt,
          choices,
          answerIndex,
          explanation: practice.explanation,
        },
      },
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function isBoundedString(value: unknown, maximumLength: number): value is string {
  return typeof value === "string" && value.length <= maximumLength;
}

function isLessonExample(value: unknown): value is { sentence: string; note: string } {
  const example = asRecord(value);
  return Boolean(example && isBoundedString(example.sentence, 2_000) && isBoundedString(example.note, 2_000));
}
