import { env } from "cloudflare:workers";
import type { GrammarLesson, LessonContent, LessonInput } from "./lesson-types";
import { EMPTY_LESSON_CONTENT } from "./lesson-types";

type LessonRow = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  school_band: string;
  domain: string;
  curriculum_code: string;
  status: "draft" | "published";
  content_json: string;
  published_at: string | null;
};

export const BUILT_IN_LESSONS: GrammarLesson[] = [
  {
    id: "builtin-nasalization",
    slug: "nasalization",
    title: "‘국물’은 왜 [궁물]로 소리 날까요?",
    summary: "소리가 이어질 때 일어나는 비음화를 발음 위치와 방법으로 이해합니다.",
    schoolBand: "중학교",
    domain: "음운·문자",
    curriculumCode: "[9국04-02] 음운 변동",
    status: "published",
    publishedAt: "2026-09-10",
    builtIn: true,
    content: {
      opening: "따뜻한 국물을 한 숟갈 떠먹었다.",
      openingNote: "우리는 ‘국물’을 적힌 그대로 [국물]이라고 읽지 않고 자연스럽게 [궁물]이라고 읽습니다.",
      concept: "비음화는 비음이 아닌 받침 ‘ㄱ, ㄷ, ㅂ’이 뒤에 오는 비음 ‘ㄴ, ㅁ’의 영향을 받아 각각 ‘ㅇ, ㄴ, ㅁ’으로 바뀌는 현상입니다. 두 소리를 잇기 편한 방향으로 발음 방법이 닮아 가는 것이 핵심입니다.",
      analysisTitle: "[국물]이 [궁물]이 되는 과정",
      analysisSteps: [
        "앞 음절의 받침은 파열음 ‘ㄱ’입니다.",
        "뒤 음절의 첫소리는 입을 다문 채 코로 내는 비음 ‘ㅁ’입니다.",
        "‘ㄱ’이 같은 발음 위치의 비음 ‘ㅇ’으로 바뀌어 [궁물]이 됩니다.",
      ],
      examples: [
        { sentence: "먹는 → [멍는]", note: "ㄱ + ㄴ → ㅇ + ㄴ" },
        { sentence: "닫는 → [단는]", note: "ㄷ + ㄴ → ㄴ + ㄴ" },
        { sentence: "앞문 → [암문]", note: "ㅂ + ㅁ → ㅁ + ㅁ" },
      ],
      comparison: "‘국밥[국빱]’처럼 뒤의 예사소리가 된소리로 바뀌는 것은 된소리되기입니다. 비음화인지 판단하려면 뒤에 ‘ㄴ, ㅁ’이 있는지, 앞 받침이 ‘ㅇ, ㄴ, ㅁ’ 가운데 하나로 바뀌었는지 확인하세요.",
      practice: {
        prompt: "다음 중 비음화가 일어나지 않는 단어는 무엇인가요?",
        choices: ["작년 [장년]", "앞날 [암날]", "국밥 [국빱]"],
        answerIndex: 2,
        explanation: "‘국밥’에서는 ‘ㅂ’이 ‘ㅃ’으로 바뀌는 된소리되기가 일어납니다. 뒤 음절의 첫소리가 비음 ‘ㄴ, ㅁ’이 아니므로 비음화가 아닙니다.",
      },
    },
  },
  {
    id: "builtin-embedded-clause",
    slug: "embedded-clause",
    title: "문장 속에 문장이 들어갈 때",
    summary: "관형절을 안은 문장을 두 문장으로 펼치며 안긴문장의 역할을 파악합니다.",
    schoolBand: "중학교",
    domain: "문장·문법 요소",
    curriculumCode: "[9국04-04] 문장의 짜임",
    status: "published",
    publishedAt: "2026-09-08",
    builtIn: true,
    content: {
      opening: "나는 [누나가 건네준] 편지를 오래 들여다보았다.",
      openingNote: "대괄호 안의 문장이 뒤의 명사 ‘편지’를 꾸며 주고 있습니다.",
      concept: "한 문장이 다른 문장 속에서 문장 성분처럼 쓰이면 ‘안긴문장’이라고 합니다. ‘누나가 건네준’은 주어와 서술어를 갖춘 작은 문장이면서, 바깥 문장에서는 ‘편지’를 꾸미는 관형어 역할을 합니다.",
      analysisTitle: "안은문장을 두 문장으로 펼쳐 보기",
      analysisSteps: [
        "누나가 편지를 건네주었다.",
        "나는 그 편지를 오래 들여다보았다.",
        "공통된 ‘편지’를 중심으로 두 문장을 합치면 관형절을 안은 문장이 됩니다.",
      ],
      examples: [
        { sentence: "철수가 읽는 책", note: "현재의 동작: 읽- + -는" },
        { sentence: "철수가 읽은 책", note: "완료된 동작: 읽- + -은" },
        { sentence: "철수가 읽을 책", note: "앞으로의 동작: 읽- + -을" },
      ],
      comparison: "관형절은 명사를 꾸미지만 부사절은 서술어를 꾸밉니다. ‘비가 소리도 없이 내린다’에서 ‘소리도 없이’는 ‘내린다’를 꾸미므로 부사절입니다.",
      practice: {
        prompt: "‘지수가 만든 케이크는 달콤했다’에서 안긴문장이 꾸미는 말은 무엇인가요?",
        choices: ["지수", "케이크", "달콤했다"],
        answerIndex: 1,
        explanation: "관형절 ‘지수가 만든’은 바로 뒤의 명사 ‘케이크’를 꾸며 줍니다.",
      },
    },
  },
  {
    id: "builtin-passive",
    slug: "passive-and-causative",
    title: "피동과 사동, 문장의 방향이 달라져요",
    summary: "주체와 대상의 관계를 바꾸어 보며 피동 표현과 사동 표현을 구별합니다.",
    schoolBand: "중학교",
    domain: "문장·문법 요소",
    curriculumCode: "[9국04-05] 문법 요소",
    status: "published",
    publishedAt: "2026-09-05",
    builtIn: true,
    content: {
      opening: "동생이 창문을 닫았다. / 창문이 동생에게 닫혔다.",
      openingNote: "두 번째 문장에서는 행동의 대상이던 ‘창문’이 문장의 주어가 되었습니다.",
      concept: "피동은 주어가 다른 힘에 의해 동작을 당하는 표현이고, 사동은 주어가 다른 대상에게 어떤 동작을 하게 하는 표현입니다. 접사 모양만 외우기보다 누가 행동하고 누가 영향을 받는지 먼저 살펴야 합니다.",
      analysisTitle: "주체와 대상의 자리를 확인하기",
      analysisSteps: [
        "능동문에서 행동 주체와 대상을 찾습니다.",
        "피동문에서는 원래 대상이 주어로 올라왔는지 확인합니다.",
        "사동문에서는 새롭게 행동을 시키는 주체가 생겼는지 확인합니다.",
      ],
      examples: [
        { sentence: "경찰이 도둑을 잡았다 → 도둑이 경찰에게 잡혔다", note: "피동" },
        { sentence: "아이가 밥을 먹었다 → 어머니가 아이에게 밥을 먹였다", note: "사동" },
      ],
      comparison: "‘보다 → 보이다’처럼 같은 형태가 문맥에 따라 피동이나 사동으로 해석되기도 합니다. 이때에는 접사만 보지 말고 문장 전체의 참여자 관계를 확인해야 합니다.",
      practice: {
        prompt: "다음 중 사동 표현은 무엇인가요?",
        choices: ["산 너머로 바다가 보인다.", "선생님이 학생에게 영상을 보였다.", "안내문이 게시판에 붙었다."],
        answerIndex: 1,
        explanation: "선생님이 학생으로 하여금 영상을 보게 했으므로 사동 표현입니다.",
      },
    },
  },
  {
    id: "builtin-word",
    slug: "word-formation",
    title: "파생어와 합성어를 가르는 기준",
    summary: "어근과 접사를 표시해 복합어의 짜임을 정확히 판별합니다.",
    schoolBand: "중학교",
    domain: "단어·품사",
    curriculumCode: "[9국04-03] 단어의 짜임",
    status: "published",
    publishedAt: "2026-09-02",
    builtIn: true,
    content: {
      opening: "맨손, 손수건, 손잡이 — 모두 ‘손’이 있지만 짜임은 서로 다릅니다.",
      openingNote: "단어를 이루는 부분이 홀로 중심 의미를 가질 수 있는지 살펴보세요.",
      concept: "둘 이상의 형태소로 이루어진 복합어 가운데 어근과 어근이 결합하면 합성어, 어근에 접사가 결합하면 파생어입니다. 접사는 홀로 쓰이지 못하고 어근의 뜻을 제한하거나 품사를 바꿉니다.",
      analysisTitle: "형태소의 역할로 판별하기",
      analysisSteps: [
        "단어를 뜻을 가진 가장 작은 단위로 나눕니다.",
        "각 부분이 어근인지 접사인지 판단합니다.",
        "어근+어근이면 합성어, 접사가 포함되면 파생어입니다.",
      ],
      examples: [
        { sentence: "눈물 = 눈 + 물", note: "어근 + 어근 → 합성어" },
        { sentence: "맨손 = 맨- + 손", note: "접두사 + 어근 → 파생어" },
        { sentence: "덮개 = 덮- + -개", note: "어근 + 접미사 → 파생어" },
      ],
      comparison: "형태가 둘로 나뉜다고 모두 복합어인 것은 아닙니다. ‘먹었다’는 어간 ‘먹-’에 문법 기능을 나타내는 어미가 붙은 활용형이지 파생어가 아닙니다.",
      practice: {
        prompt: "다음 중 합성어는 무엇인가요?",
        choices: ["풋사과", "높이다", "돌다리"],
        answerIndex: 2,
        explanation: "‘돌’과 ‘다리’는 모두 중심 의미를 지닌 어근이므로 ‘돌다리’는 합성어입니다.",
      },
    },
  },
  {
    id: "builtin-hunminjeongeum",
    slug: "hunminjeongeum-consonants",
    title: "훈민정음의 자음자는 어떻게 만들어졌을까?",
    summary: "기본자와 가획자의 관계를 발음 기관의 모양과 소리의 세기로 이해합니다.",
    schoolBand: "고등학교 공통국어",
    domain: "국어의 역사",
    curriculumCode: "국어의 역사와 한글",
    status: "published",
    publishedAt: "2026-08-28",
    builtIn: true,
    content: {
      opening: "ㄱ · ㄴ · ㅁ · ㅅ · ㅇ",
      openingNote: "훈민정음의 다섯 기본자는 소리를 낼 때의 발음 기관 모양을 본떠 만들었습니다.",
      concept: "초성 기본자 ‘ㄱ, ㄴ, ㅁ, ㅅ, ㅇ’은 각각 혀뿌리, 혀끝, 입술, 이, 목구멍의 모양을 본떴습니다. 기본자에 획을 더해 같은 자리에서 더 센 소리를 나타내는 글자를 만든 원리가 가획입니다.",
      analysisTitle: "상형에서 가획으로 이어지는 원리",
      analysisSteps: [
        "‘ㄴ’은 혀끝이 윗잇몸에 닿는 모습을 본뜬 기본자입니다.",
        "같은 자리에서 더 거센 소리 ‘ㄷ’을 나타내기 위해 획을 더합니다.",
        "‘ㄷ’에 다시 획을 더해 ‘ㅌ’을 만듭니다.",
      ],
      examples: [
        { sentence: "ㄱ → ㅋ", note: "어금닛소리 기본자와 가획자" },
        { sentence: "ㄴ → ㄷ → ㅌ", note: "혓소리 기본자와 가획자" },
        { sentence: "ㅁ → ㅂ → ㅍ", note: "입술소리 기본자와 가획자" },
      ],
      comparison: "‘ㅇ’에 획을 더한 ‘ㆆ, ㅎ’처럼 가획 관계가 나타나는 글자도 있지만, ‘ㆁ, ㄹ, ㅿ’은 소리의 성격이 달라 기본자나 가획자와 같은 방식으로 설명하지 않는 이체자입니다.",
      practice: {
        prompt: "기본자 ‘ㄴ’에 획을 더해 만든 글자의 순서로 알맞은 것은 무엇인가요?",
        choices: ["ㄴ → ㄷ → ㅌ", "ㄴ → ㄹ → ㅌ", "ㄴ → ㅅ → ㅈ"],
        answerIndex: 0,
        explanation: "혀끝이 닿는 모양을 본뜬 ‘ㄴ’에 획을 더해 ‘ㄷ’을, 다시 획을 더해 ‘ㅌ’을 만들었습니다.",
      },
    },
  },
  {
    id: "builtin-spacing",
    slug: "dependent-noun-spacing",
    title: "‘할 수 있다’는 왜 띄어 쓸까요?",
    summary: "의존 명사와 조사를 구별해 자주 틀리는 띄어쓰기의 원리를 익힙니다.",
    schoolBand: "중학교",
    domain: "어문 규범·국어 생활",
    curriculumCode: "한글 맞춤법과 국어 생활",
    status: "published",
    publishedAt: "2026-08-24",
    builtIn: true,
    content: {
      opening: "오늘은 숙제를 다 할 수 있다.",
      openingNote: "‘수’는 앞말의 꾸밈을 받아 쓰이는 의존 명사이므로 앞말과 띄어 씁니다.",
      concept: "의존 명사는 의미가 형식적이고 홀로 쓰이기 어렵지만 명사이므로 앞말과 띄어 씁니다. 반면 조사는 앞말에 붙여 씁니다. 품사를 확인하면 띄어쓰기의 이유도 설명할 수 있습니다.",
      analysisTitle: "‘할 수 있다’를 품사로 나누기",
      analysisSteps: [
        "‘할’은 뒤의 명사 ‘수’를 꾸미는 관형어입니다.",
        "‘수’는 가능성이나 능력을 나타내는 의존 명사입니다.",
        "명사인 ‘수’는 앞말과 띄고, 뒤의 ‘있다’와도 띄어 씁니다.",
      ],
      examples: [
        { sentence: "아는 것이 힘이다.", note: "의존 명사 ‘것’을 띄어 씀" },
        { sentence: "떠난 지 오래되었다.", note: "의존 명사 ‘지’를 띄어 씀" },
        { sentence: "너밖에 없다.", note: "조사 ‘밖에’를 붙여 씀" },
      ],
      comparison: "‘밖에’는 ‘그것 말고는’의 뜻을 더하는 조사일 때 붙여 씁니다. 그러나 ‘집 밖에 사람이 있다’의 ‘밖’은 명사이고 ‘에’는 조사이므로 앞말 ‘집’과 띄어 씁니다.",
      practice: {
        prompt: "띄어쓰기가 바른 문장은 무엇인가요?",
        choices: ["그럴리가 없다.", "만난 지 오래되었다.", "학교 뿐만 아니라 집에서도 읽었다."],
        answerIndex: 1,
        explanation: "의존 명사 ‘지’는 앞말과 띄어 씁니다. ‘리’도 의존 명사라 띄고, 조사 ‘뿐만 아니라’의 ‘뿐’은 앞말에 붙여 씁니다.",
      },
    },
  },
];

function database(): D1Database {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

function parseContent(value: string): LessonContent {
  try {
    const parsed = JSON.parse(value) as Partial<LessonContent>;
    return {
      ...EMPTY_LESSON_CONTENT,
      ...parsed,
      analysisSteps: Array.isArray(parsed.analysisSteps) ? parsed.analysisSteps : EMPTY_LESSON_CONTENT.analysisSteps,
      examples: Array.isArray(parsed.examples) ? parsed.examples : EMPTY_LESSON_CONTENT.examples,
      practice: { ...EMPTY_LESSON_CONTENT.practice, ...(parsed.practice ?? {}) },
    };
  } catch {
    return EMPTY_LESSON_CONTENT;
  }
}

function rowToLesson(row: LessonRow): GrammarLesson {
  return {
    id: row.id, slug: row.slug, title: row.title, summary: row.summary,
    schoolBand: row.school_band, domain: row.domain, curriculumCode: row.curriculum_code,
    status: row.status, content: parseContent(row.content_json), publishedAt: row.published_at,
  };
}

export async function getPublishedLessons(): Promise<GrammarLesson[]> {
  try {
    const result = await database().prepare(
      `SELECT id, slug, title, summary, school_band, domain, curriculum_code, status, content_json, published_at
       FROM grammar_lessons WHERE status = ? ORDER BY published_at DESC LIMIT 60`,
    ).bind("published").all<LessonRow>();
    return [...result.results.map(rowToLesson), ...BUILT_IN_LESSONS];
  } catch (error) {
    console.error("Unable to load published grammar lessons", error);
    return BUILT_IN_LESSONS;
  }
}

export async function getLessonBySlug(slug: string): Promise<GrammarLesson | null> {
  const builtIn = BUILT_IN_LESSONS.find((lesson) => lesson.slug === slug);
  if (builtIn) return builtIn;
  try {
    const row = await database().prepare(
      `SELECT id, slug, title, summary, school_band, domain, curriculum_code, status, content_json, published_at
       FROM grammar_lessons WHERE slug = ? AND status = ? LIMIT 1`,
    ).bind(slug, "published").first<LessonRow>();
    return row ? rowToLesson(row) : null;
  } catch (error) {
    console.error("Unable to load grammar lesson", error);
    return null;
  }
}

export async function getOwnedLessons(ownerId: string): Promise<GrammarLesson[]> {
  try {
    const result = await database().prepare(
      `SELECT id, slug, title, summary, school_band, domain, curriculum_code, status, content_json, published_at
       FROM grammar_lessons WHERE owner_id = ? ORDER BY updated_at DESC`,
    ).bind(ownerId).all<LessonRow>();
    return result.results.map(rowToLesson);
  } catch (error) {
    console.error("Unable to load the editing library", error);
    return [];
  }
}

export async function saveLesson(ownerId: string, input: LessonInput): Promise<GrammarLesson> {
  const now = new Date().toISOString();
  const publishedAt = input.status === "published" ? now : null;
  const db = database();
  if (input.id) {
    await db.prepare(
      `UPDATE grammar_lessons SET slug = ?, title = ?, summary = ?, school_band = ?, domain = ?,
       curriculum_code = ?, status = ?, content_json = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, ?) ELSE NULL END,
       updated_at = ? WHERE id = ? AND owner_id = ?`,
    ).bind(
      input.slug, input.title, input.summary, input.schoolBand, input.domain, input.curriculumCode,
      input.status, JSON.stringify(input.content), input.status, publishedAt, now, input.id, ownerId,
    ).run();
    const updated = await db.prepare(
      `SELECT id, slug, title, summary, school_band, domain, curriculum_code, status, content_json, published_at
       FROM grammar_lessons WHERE id = ? AND owner_id = ? LIMIT 1`,
    ).bind(input.id, ownerId).first<LessonRow>();
    if (!updated) throw new Error("수정할 자료를 찾을 수 없습니다.");
    return rowToLesson(updated);
  }

  const result = await db.prepare(
    `INSERT INTO grammar_lessons
     (owner_id, slug, title, summary, school_band, domain, curriculum_code, status, content_json, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    ownerId, input.slug, input.title, input.summary, input.schoolBand, input.domain,
    input.curriculumCode, input.status, JSON.stringify(input.content), publishedAt, now, now,
  ).run();
  const created = await db.prepare(
    `SELECT id, slug, title, summary, school_band, domain, curriculum_code, status, content_json, published_at
     FROM grammar_lessons WHERE id = ? AND owner_id = ? LIMIT 1`,
  ).bind(result.meta.last_row_id, ownerId).first<LessonRow>();
  if (!created) throw new Error("저장한 자료를 다시 불러오지 못했습니다.");
  return rowToLesson(created);
}
