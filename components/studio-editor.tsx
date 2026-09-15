"use client";

import { useState } from "react";
import {
  BookOpenCheck,
  Brackets,
  CircleDot,
  GitCompareArrows,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  EMPTY_LESSON_CONTENT,
  GRAMMAR_DOMAINS,
  SCHOOL_BANDS,
  type GrammarLesson,
  type LessonInput,
  type LessonStatus,
} from "@/lib/lesson-types";

const MAX_STEPS = 12;
const MAX_EXAMPLES = 12;
const MAX_CHOICES = 6;

export function StudioEditor({ initialLesson }: { initialLesson?: GrammarLesson }) {
  const [lesson, setLesson] = useState<LessonInput>(() => makeInitialLesson(initialLesson));
  const [saving, setSaving] = useState<LessonStatus | null>(null);

  function setField<K extends keyof LessonInput>(key: K, value: LessonInput[K]) {
    setLesson((current) => ({ ...current, [key]: value }));
  }

  function setContent<K extends keyof LessonInput["content"]>(key: K, value: LessonInput["content"][K]) {
    setLesson((current) => ({ ...current, content: { ...current.content, [key]: value } }));
  }

  function setAnalysisStep(index: number, value: string) {
    setLesson((current) => ({
      ...current,
      content: {
        ...current.content,
        analysisSteps: current.content.analysisSteps.map((step, stepIndex) => stepIndex === index ? value : step),
      },
    }));
  }

  function addAnalysisStep() {
    setLesson((current) => current.content.analysisSteps.length >= MAX_STEPS ? current : ({
      ...current,
      content: { ...current.content, analysisSteps: [...current.content.analysisSteps, ""] },
    }));
  }

  function removeAnalysisStep(index: number) {
    setLesson((current) => current.content.analysisSteps.length <= 1 ? current : ({
      ...current,
      content: { ...current.content, analysisSteps: current.content.analysisSteps.filter((_, stepIndex) => stepIndex !== index) },
    }));
  }

  function setExample(index: number, key: "sentence" | "note", value: string) {
    setLesson((current) => ({
      ...current,
      content: {
        ...current.content,
        examples: current.content.examples.map((example, exampleIndex) => exampleIndex === index ? { ...example, [key]: value } : example),
      },
    }));
  }

  function addExample() {
    setLesson((current) => current.content.examples.length >= MAX_EXAMPLES ? current : ({
      ...current,
      content: { ...current.content, examples: [...current.content.examples, { sentence: "", note: "" }] },
    }));
  }

  function removeExample(index: number) {
    setLesson((current) => current.content.examples.length <= 1 ? current : ({
      ...current,
      content: { ...current.content, examples: current.content.examples.filter((_, exampleIndex) => exampleIndex !== index) },
    }));
  }

  function setPractice<K extends keyof LessonInput["content"]["practice"]>(key: K, value: LessonInput["content"]["practice"][K]) {
    setLesson((current) => ({
      ...current,
      content: { ...current.content, practice: { ...current.content.practice, [key]: value } },
    }));
  }

  function setChoice(index: number, value: string) {
    setLesson((current) => ({
      ...current,
      content: {
        ...current.content,
        practice: {
          ...current.content.practice,
          choices: current.content.practice.choices.map((choice, choiceIndex) => choiceIndex === index ? value : choice),
        },
      },
    }));
  }

  function addChoice() {
    setLesson((current) => current.content.practice.choices.length >= MAX_CHOICES ? current : ({
      ...current,
      content: {
        ...current.content,
        practice: { ...current.content.practice, choices: [...current.content.practice.choices, ""] },
      },
    }));
  }

  function removeChoice(index: number) {
    setLesson((current) => {
      const practice = current.content.practice;
      if (practice.choices.length <= 2) return current;
      const choices = practice.choices.filter((_, choiceIndex) => choiceIndex !== index);
      const answerIndex = practice.answerIndex === index ? 0 : practice.answerIndex > index ? practice.answerIndex - 1 : practice.answerIndex;
      return {
        ...current,
        content: { ...current.content, practice: { ...practice, choices, answerIndex } },
      };
    });
  }

  async function save(status: LessonStatus) {
    setSaving(status);
    try {
      const slug = lesson.slug.trim() || (status === "published" ? makeFallbackSlug() : "");
      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...lesson, slug, status }),
      });
      const result = await response.json() as { lesson?: GrammarLesson; error?: string };
      if (!response.ok || !result.lesson) throw new Error(result.error || "자료를 저장하지 못했습니다.");
      setLesson(makeInitialLesson(result.lesson));
      toast.success(status === "published" ? "학습 자료를 출판했어요." : "초안을 저장했어요.");
      window.setTimeout(() => window.location.replace(`/studio?edit=${result.lesson?.id}`), 500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "자료를 저장하지 못했습니다.");
      setSaving(null);
    }
  }

  return (
    <section className="studio-workspace">
      <Toaster position="top-center" richColors />
      <div className="editor-scroll">
        <section className="teacher-inline grammar-teacher-inline">
          <div className="teacher-head">
            <div>
              <p>TEACHER STUDIO</p>
              <h2>출판 지면에서 바로 작성하기</h2>
              <span>학생이 읽게 될 화면에서 제목·개념·예문·확인 문제를 곧바로 편집합니다.</span>
            </div>
            <span className={`editor-status ${lesson.status}`}>{lesson.status === "published" ? "출판됨" : "초안"}</span>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); void save("published"); }}>
            <article className="lesson-paper lesson-editor-paper">
              <header className="lesson-hero lesson-editor-hero">
                <div className="lesson-kicker editor-kicker">
                  <label>
                    <span>문법 영역</span>
                    <select value={lesson.domain} onChange={(event) => setField("domain", event.target.value)}>
                      {GRAMMAR_DOMAINS.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>학교급</span>
                    <select value={lesson.schoolBand} onChange={(event) => setField("schoolBand", event.target.value)}>
                      {SCHOOL_BANDS.map((band) => <option key={band} value={band}>{band}</option>)}
                    </select>
                  </label>
                </div>

                <label className="sr-only" htmlFor="lesson-editor-title">자료 제목</label>
                <input
                  className="publication-input lesson-title-input"
                  id="lesson-editor-title"
                  maxLength={140}
                  placeholder="자료 제목을 입력해 주세요."
                  value={lesson.title}
                  onChange={(event) => setField("title", event.target.value)}
                />
                <label className="sr-only" htmlFor="lesson-editor-summary">한 줄 요약</label>
                <textarea
                  className="publication-input lesson-summary-input"
                  id="lesson-editor-summary"
                  maxLength={320}
                  placeholder="학생에게 보여 줄 한 줄 요약을 입력해 주세요."
                  value={lesson.summary}
                  onChange={(event) => setField("summary", event.target.value)}
                />
                <div className="lesson-meta-line editor-meta-line">
                  <label><span>교육과정</span><input maxLength={100} placeholder="예: [9국04-04]" value={lesson.curriculumCode} onChange={(event) => setField("curriculumCode", event.target.value)} /></label>
                  <label><span>자료 주소</span><span className="slug-field"><b>/lesson/</b><input maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="비워 두면 자동 생성" value={lesson.slug} onChange={(event) => setField("slug", event.target.value.toLowerCase().trim())} /></span></label>
                </div>
              </header>

              <div className="lesson-layout">
                <aside className="lesson-rail editor-lesson-rail" aria-label="편집할 부분 바로가기">
                  <a href="#editor-opening">첫 문장</a>
                  <a href="#editor-concept">핵심 개념</a>
                  <a href="#editor-analysis">문장 해부</a>
                  <a href="#editor-compare">헷갈림 비교</a>
                  <a href="#editor-check">확인 문제</a>
                </aside>

                <div className="lesson-content">
                  <section id="editor-opening" className="lesson-block opening-block editor-lesson-block">
                    <div className="block-title"><CircleDot aria-hidden="true" /><span>첫 문장</span></div>
                    <label className="sr-only" htmlFor="lesson-editor-opening">수업을 여는 문장</label>
                    <textarea
                      className="publication-input opening-editor"
                      id="lesson-editor-opening"
                      maxLength={4000}
                      placeholder="개념부터 설명하기보다 학생이 궁금해할 실제 문장으로 시작해 보세요."
                      value={lesson.content.opening}
                      onChange={(event) => setContent("opening", event.target.value)}
                    />
                    <label className="sr-only" htmlFor="lesson-editor-opening-note">첫 관찰</label>
                    <textarea
                      className="publication-input opening-note-editor"
                      id="lesson-editor-opening-note"
                      maxLength={2000}
                      placeholder="이 문장에서 가장 먼저 발견해야 할 점을 적어 주세요."
                      value={lesson.content.openingNote}
                      onChange={(event) => setContent("openingNote", event.target.value)}
                    />
                  </section>

                  <section id="editor-concept" className="lesson-block editor-lesson-block">
                    <div className="block-title"><BookOpenCheck aria-hidden="true" /><span>핵심 개념</span></div>
                    <label className="sr-only" htmlFor="lesson-editor-concept">핵심 개념 설명</label>
                    <textarea
                      className="publication-input concept-editor"
                      id="lesson-editor-concept"
                      maxLength={10000}
                      placeholder="용어의 정의와 반드시 기억할 판별 기준을 설명해 주세요."
                      value={lesson.content.concept}
                      onChange={(event) => setContent("concept", event.target.value)}
                    />
                  </section>

                  <section id="editor-analysis" className="lesson-block editor-lesson-block">
                    <div className="block-title"><Brackets aria-hidden="true" /><span>문장 해부</span></div>
                    <label className="sr-only" htmlFor="lesson-editor-analysis-title">분석 제목</label>
                    <input
                      className="publication-input analysis-title-editor"
                      id="lesson-editor-analysis-title"
                      maxLength={200}
                      placeholder="분석 활동의 제목을 적어 주세요."
                      value={lesson.content.analysisTitle}
                      onChange={(event) => setContent("analysisTitle", event.target.value)}
                    />
                    <ol className="analysis-list editor-analysis-list">
                      {lesson.content.analysisSteps.map((step, index) => (
                        <li key={index}>
                          <div className="repeat-field">
                            <label className="sr-only" htmlFor={`analysis-step-${index}`}>{index + 1}단계</label>
                            <textarea id={`analysis-step-${index}`} maxLength={1000} placeholder="한 단계에 한 가지 판단을 적어 주세요." value={step} onChange={(event) => setAnalysisStep(index, event.target.value)} />
                            <button type="button" className="delete-inline" disabled={lesson.content.analysisSteps.length <= 1} aria-label={`${index + 1}단계 삭제`} onClick={() => removeAnalysisStep(index)}><Trash2 aria-hidden="true" /></button>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <button className="add-inline" type="button" disabled={lesson.content.analysisSteps.length >= MAX_STEPS} onClick={addAnalysisStep}><Plus aria-hidden="true" /> 분석 단계 추가</button>

                    <div className="example-list editor-example-list">
                      {lesson.content.examples.map((example, index) => (
                        <div className="editor-example-row" key={index}>
                          <label><span>예문 {index + 1}</span><input maxLength={2000} placeholder="예문을 입력해 주세요." value={example.sentence} onChange={(event) => setExample(index, "sentence", event.target.value)} /></label>
                          <label><span>분석</span><textarea maxLength={2000} placeholder="예문에 적용되는 원리를 설명해 주세요." value={example.note} onChange={(event) => setExample(index, "note", event.target.value)} /></label>
                          <button type="button" className="delete-inline" disabled={lesson.content.examples.length <= 1} aria-label={`예문 ${index + 1} 삭제`} onClick={() => removeExample(index)}><Trash2 aria-hidden="true" /></button>
                        </div>
                      ))}
                    </div>
                    <button className="add-inline" type="button" disabled={lesson.content.examples.length >= MAX_EXAMPLES} onClick={addExample}><Plus aria-hidden="true" /> 예문 추가</button>
                  </section>

                  <section id="editor-compare" className="lesson-block editor-lesson-block">
                    <div className="block-title"><GitCompareArrows aria-hidden="true" /><span>헷갈림 비교</span></div>
                    <div className="compare-note editor-compare-note">
                      <h2>같아 보여도 판별 기준은 달라요.</h2>
                      <label className="sr-only" htmlFor="lesson-editor-comparison">헷갈리는 개념 비교</label>
                      <textarea id="lesson-editor-comparison" maxLength={6000} placeholder="비슷해 보이는 개념과 무엇이 다른지 판별 기준으로 설명해 주세요." value={lesson.content.comparison} onChange={(event) => setContent("comparison", event.target.value)} />
                    </div>
                  </section>

                  <section id="editor-check" className="lesson-block editor-lesson-block">
                    <div className="block-title"><BookOpenCheck aria-hidden="true" /><span>확인 문제</span></div>
                    <div className="practice-card practice-editor-card">
                      <p className="practice-label">CHECK YOUR GRAMMAR</p>
                      <label className="sr-only" htmlFor="lesson-editor-prompt">확인 문제</label>
                      <textarea id="lesson-editor-prompt" className="practice-prompt-editor" maxLength={2000} placeholder="한 개념을 정확히 확인하는 문제를 적어 주세요." value={lesson.content.practice.prompt} onChange={(event) => setPractice("prompt", event.target.value)} />
                      <div className="practice-editor-options">
                        {lesson.content.practice.choices.map((choice, index) => (
                          <div className="practice-editor-option" key={index}>
                            <label className="answer-radio" title="정답으로 지정">
                              <input type="radio" name="answer" checked={lesson.content.practice.answerIndex === index} onChange={() => setPractice("answerIndex", index)} />
                              <b>{index + 1}</b>
                              <span className="sr-only">선택지 {index + 1}을 정답으로 지정</span>
                            </label>
                            <label className="sr-only" htmlFor={`practice-choice-${index}`}>선택지 {index + 1}</label>
                            <input id={`practice-choice-${index}`} maxLength={500} placeholder={`선택지 ${index + 1}`} value={choice} onChange={(event) => setChoice(index, event.target.value)} />
                            <button type="button" disabled={lesson.content.practice.choices.length <= 2} aria-label={`선택지 ${index + 1} 삭제`} onClick={() => removeChoice(index)}><Trash2 aria-hidden="true" /></button>
                          </div>
                        ))}
                      </div>
                      <button className="add-choice" type="button" disabled={lesson.content.practice.choices.length >= MAX_CHOICES} onClick={addChoice}><Plus aria-hidden="true" /> 선택지 추가</button>
                      <label className="practice-explanation-label" htmlFor="lesson-editor-explanation">정답 풀이</label>
                      <textarea id="lesson-editor-explanation" className="practice-explanation-editor" maxLength={4000} placeholder="왜 이것이 정답인지 판별 기준을 넣어 설명해 주세요." value={lesson.content.practice.explanation} onChange={(event) => setPractice("explanation", event.target.value)} />
                    </div>
                  </section>
                </div>
              </div>
            </article>

            <div className="publish-bar grammar-publish-bar">
              <span className="publish-status-copy">{lesson.id ? `‘${lesson.title || "제목 없는 자료"}’ 수정 중` : "새 학습 자료 작성 중"}</span>
              <a href="/">취소</a>
              <button type="button" disabled={saving !== null} onClick={() => void save("draft")}>
                {saving === "draft" ? <Loader2 className="spin" aria-hidden="true" /> : <Save aria-hidden="true" />} 임시 저장
              </button>
              <button type="submit" className="primary" disabled={saving !== null}>
                {saving === "published" ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />} {lesson.status === "published" ? "수정 내용 다시 출판" : "학습 자료 출판하기"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}

function makeInitialLesson(lesson?: GrammarLesson): LessonInput {
  if (lesson) {
    return {
      id: typeof lesson.id === "number" ? lesson.id : undefined,
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary,
      schoolBand: lesson.schoolBand,
      domain: lesson.domain,
      curriculumCode: lesson.curriculumCode,
      status: lesson.status,
      content: structuredClone(lesson.content),
    };
  }
  return {
    slug: "",
    title: "",
    summary: "",
    schoolBand: SCHOOL_BANDS[0],
    domain: GRAMMAR_DOMAINS[0],
    curriculumCode: "",
    status: "draft",
    content: structuredClone(EMPTY_LESSON_CONTENT),
  };
}

function makeFallbackSlug() {
  return `lesson-${Date.now().toString(36)}`;
}
