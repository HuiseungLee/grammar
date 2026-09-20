export const GRAMMAR_DOMAINS = [
  "언어학 개론",
  "음운론",
  "형태론",
  "통사론",
  "중세국어",
  "국어규범",
  "국어사",
] as const;

export const SCHOOL_BANDS = ["중학교", "고등학교 공통국어", "고등학교 화법과 언어"] as const;

export type LessonStatus = "draft" | "published";

export type LessonContent = {
  opening: string;
  openingNote: string;
  concept: string;
  analysisTitle: string;
  analysisSteps: string[];
  examples: Array<{ sentence: string; note: string }>;
  comparison: string;
  practice: {
    prompt: string;
    choices: string[];
    answerIndex: number;
    explanation: string;
  };
};

export type GrammarLesson = {
  id: number | string;
  slug: string;
  title: string;
  summary: string;
  schoolBand: string;
  domain: string;
  curriculumCode: string;
  status: LessonStatus;
  content: LessonContent;
  publishedAt: string | null;
  builtIn?: boolean;
};

export type LessonInput = Omit<GrammarLesson, "id" | "publishedAt" | "builtIn"> & {
  id?: number;
};

export const EMPTY_LESSON_CONTENT: LessonContent = {
  opening: "",
  openingNote: "",
  concept: "",
  analysisTitle: "문장을 차근차근 살펴볼까요?",
  analysisSteps: ["", "", ""],
  examples: [
    { sentence: "", note: "" },
    { sentence: "", note: "" },
  ],
  comparison: "",
  practice: { prompt: "", choices: ["", "", ""], answerIndex: 0, explanation: "" },
};
