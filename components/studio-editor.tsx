"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, FileText, Loader2, Save, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { EMPTY_LESSON_CONTENT, GRAMMAR_DOMAINS, SCHOOL_BANDS, type GrammarLesson, type LessonInput, type LessonStatus } from "@/lib/lesson-types";

export function StudioEditor({ initialLesson }: { initialLesson?: GrammarLesson }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonInput>(() => makeInitialLesson(initialLesson));
  const [saving, setSaving] = useState<LessonStatus | null>(null);

  function setField<K extends keyof LessonInput>(key: K, value: LessonInput[K]) {
    setLesson((current) => ({ ...current, [key]: value }));
  }

  function setContent<K extends keyof LessonInput["content"]>(key: K, value: LessonInput["content"][K]) {
    setLesson((current) => ({ ...current, content: { ...current.content, [key]: value } }));
  }

  function setAnalysisStep(index: number, value: string) {
    setContent("analysisSteps", lesson.content.analysisSteps.map((step, stepIndex) => stepIndex === index ? value : step));
  }

  function setExample(index: number, key: "sentence" | "note", value: string) {
    setContent("examples", lesson.content.examples.map((example, exampleIndex) => exampleIndex === index ? { ...example, [key]: value } : example));
  }

  function setPractice(key: keyof LessonInput["content"]["practice"], value: string | number | string[]) {
    setContent("practice", { ...lesson.content.practice, [key]: value });
  }

  function setChoice(index: number, value: string) {
    setPractice("choices", lesson.content.practice.choices.map((choice, choiceIndex) => choiceIndex === index ? value : choice));
  }

  async function save(status: LessonStatus) {
    setSaving(status);
    try {
      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...lesson, status }),
      });
      const result = await response.json() as { lesson?: GrammarLesson; error?: string };
      if (!response.ok || !result.lesson) throw new Error(result.error || "자료를 저장하지 못했습니다.");
      setLesson(makeInitialLesson(result.lesson));
      toast.success(status === "published" ? "학습 자료를 출판했어요." : "초안을 저장했어요.");
      router.replace(`/studio?edit=${result.lesson.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "자료를 저장하지 못했습니다.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="studio-workspace">
      <Toaster position="top-center" richColors />
      <Tabs defaultValue="edit" className="studio-tabs">
        <div className="studio-toolbar">
          <div><span>{lesson.id ? "자료 수정" : "새 학습 자료"}</span><strong>{lesson.title || "제목 없는 자료"}</strong></div>
          <TabsList aria-label="편집 화면 선택"><TabsTrigger value="edit"><FileText /> 편집</TabsTrigger><TabsTrigger value="preview"><Eye /> 미리보기</TabsTrigger></TabsList>
          <div className="studio-actions">
            <Button variant="outline" disabled={saving !== null} onClick={() => save("draft")}>
              {saving === "draft" ? <Loader2 className="spin" /> : <Save />} 임시 저장
            </Button>
            <Button disabled={saving !== null} onClick={() => save("published")}>
              {saving === "published" ? <Loader2 className="spin" /> : <Send />} {lesson.status === "published" ? "수정 반영" : "검사 후 출판"}
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="editor-scroll">
          <form className="lesson-editor" onSubmit={(event) => event.preventDefault()}>
            <EditorSection number="01" title="기본 정보" description="학생이 자료를 찾고 이해하는 데 필요한 정보를 적습니다.">
              <div className="editor-grid two">
                <Field label="제목" hint="질문이나 발견의 형태로 쓰면 좋아요."><Input value={lesson.title} onChange={(event) => setField("title", event.target.value)} placeholder="예: 문장 속에 문장이 들어갈 때" /></Field>
                <Field label="자료 주소" hint="영문 소문자·숫자·하이픈만 사용해요."><Input value={lesson.slug} onChange={(event) => setField("slug", event.target.value.toLowerCase())} placeholder="embedded-clause" /></Field>
              </div>
              <Field label="한 줄 요약"><Input value={lesson.summary} onChange={(event) => setField("summary", event.target.value)} placeholder="이 자료에서 배우는 핵심을 한 문장으로 적어 주세요." /></Field>
              <div className="editor-grid three">
                <Field label="문법 영역"><Select value={lesson.domain} onValueChange={(value) => setField("domain", value)}><SelectTrigger className="editor-select"><SelectValue /></SelectTrigger><SelectContent>{GRAMMAR_DOMAINS.map((domain) => <SelectItem key={domain} value={domain}>{domain}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="학교급"><Select value={lesson.schoolBand} onValueChange={(value) => setField("schoolBand", value)}><SelectTrigger className="editor-select"><SelectValue /></SelectTrigger><SelectContent>{SCHOOL_BANDS.map((band) => <SelectItem key={band} value={band}>{band}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="교육과정 메모"><Input value={lesson.curriculumCode} onChange={(event) => setField("curriculumCode", event.target.value)} placeholder="예: [9국04-04]" /></Field>
              </div>
            </EditorSection>

            <EditorSection number="02" title="첫 문장" description="개념부터 설명하지 말고, 학생이 궁금해할 실제 문장으로 시작합니다.">
              <Field label="수업을 여는 문장"><Textarea className="editor-tall" value={lesson.content.opening} onChange={(event) => setContent("opening", event.target.value)} placeholder="분석할 문장이나 대비되는 두 문장을 적어 주세요." /></Field>
              <Field label="첫 관찰"><Textarea value={lesson.content.openingNote} onChange={(event) => setContent("openingNote", event.target.value)} placeholder="이 문장에서 학생이 가장 먼저 발견해야 할 점은 무엇인가요?" /></Field>
            </EditorSection>

            <EditorSection number="03" title="핵심 개념과 분석" description="판별 기준이 드러나도록 설명하고 분석 순서를 나눕니다.">
              <Field label="핵심 개념"><Textarea className="editor-tall" value={lesson.content.concept} onChange={(event) => setContent("concept", event.target.value)} placeholder="용어의 정의와 반드시 기억할 판별 기준을 설명해 주세요." /></Field>
              <Field label="분석 제목"><Input value={lesson.content.analysisTitle} onChange={(event) => setContent("analysisTitle", event.target.value)} /></Field>
              <div className="step-editor">
                {lesson.content.analysisSteps.map((step, index) => <Field key={index} label={`${index + 1}단계`}><Input value={step} onChange={(event) => setAnalysisStep(index, event.target.value)} placeholder="한 단계에 한 가지 판단만 적어 주세요." /></Field>)}
              </div>
            </EditorSection>

            <EditorSection number="04" title="예문과 비교" description="같은 원리가 적용되는 예문과 헷갈리는 개념을 함께 보여 줍니다.">
              <div className="example-editor">
                {lesson.content.examples.map((example, index) => <div key={index}><span>예문 {index + 1}</span><Input value={example.sentence} onChange={(event) => setExample(index, "sentence", event.target.value)} placeholder="예문" /><Input value={example.note} onChange={(event) => setExample(index, "note", event.target.value)} placeholder="분석 또는 설명" /></div>)}
              </div>
              <Field label="헷갈림 비교"><Textarea className="editor-tall" value={lesson.content.comparison} onChange={(event) => setContent("comparison", event.target.value)} placeholder="비슷해 보이는 개념과 무엇이 다른지 판별 기준으로 설명해 주세요." /></Field>
            </EditorSection>

            <EditorSection number="05" title="확인 문제" description="정답만 맞히는 문제보다 판별 기준을 다시 쓰게 하는 문제를 권합니다.">
              <Field label="문제"><Textarea value={lesson.content.practice.prompt} onChange={(event) => setPractice("prompt", event.target.value)} placeholder="한 개념을 정확히 확인하는 문제를 적어 주세요." /></Field>
              <RadioGroup className="choice-editor" value={String(lesson.content.practice.answerIndex)} onValueChange={(value) => setPractice("answerIndex", Number(value))}>
                {lesson.content.practice.choices.map((choice, index) => <Field key={index} label={`선택지 ${index + 1}`}><div className="choice-row"><Input value={choice} onChange={(event) => setChoice(index, event.target.value)} /><span className="answer-choice"><RadioGroupItem aria-label={`선택지 ${index + 1}을 정답으로 지정`} value={String(index)} /> 정답</span></div></Field>)}
              </RadioGroup>
              <Field label="정답 풀이"><Textarea value={lesson.content.practice.explanation} onChange={(event) => setPractice("explanation", event.target.value)} placeholder="왜 이것이 정답인지 판별 기준을 넣어 설명해 주세요." /></Field>
            </EditorSection>
          </form>
        </TabsContent>

        <TabsContent value="preview" className="editor-scroll"><LessonPreview lesson={lesson} /></TabsContent>
      </Tabs>
    </section>
  );
}

function EditorSection({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="editor-section"><header><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></header><div className="editor-section-body">{children}</div></section>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="editor-field"><span>{label}</span>{hint && <small>{hint}</small>}{children}</label>;
}

function LessonPreview({ lesson }: { lesson: LessonInput }) {
  return <div className="studio-preview"><div className="preview-status"><Sparkles /> 실제 학습 화면의 축소 미리보기</div><article><header><span>{lesson.domain}</span><small>{lesson.schoolBand}</small><h1>{lesson.title || "자료 제목을 입력해 주세요."}</h1><p>{lesson.summary || "한 줄 요약이 이곳에 나타납니다."}</p></header><section><b>첫 문장</b><blockquote>{lesson.content.opening || "수업을 여는 문장이 이곳에 나타납니다."}</blockquote><p>{lesson.content.openingNote}</p></section><section><b>핵심 개념</b><p>{lesson.content.concept || "핵심 개념 설명이 이곳에 나타납니다."}</p></section><section><b>문장 해부</b><h2>{lesson.content.analysisTitle}</h2><ol>{lesson.content.analysisSteps.filter(Boolean).map((step, index) => <li key={index}><Check />{step}</li>)}</ol></section></article></div>;
}

function makeInitialLesson(lesson?: GrammarLesson): LessonInput {
  if (lesson) return { id: typeof lesson.id === "number" ? lesson.id : undefined, slug: lesson.slug, title: lesson.title, summary: lesson.summary, schoolBand: lesson.schoolBand, domain: lesson.domain, curriculumCode: lesson.curriculumCode, status: lesson.status, content: structuredClone(lesson.content) };
  return { slug: "", title: "", summary: "", schoolBand: SCHOOL_BANDS[0], domain: GRAMMAR_DOMAINS[0], curriculumCode: "", status: "draft", content: structuredClone(EMPTY_LESSON_CONTENT) };
}
