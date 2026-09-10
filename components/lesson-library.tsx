"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpenText, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GRAMMAR_DOMAINS, SCHOOL_BANDS, type GrammarLesson } from "@/lib/lesson-types";

type ModelContextShape = {
  registerTool: (tool: {
    name: string;
    title?: string;
    description: string;
    inputSchema: object;
    annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
    execute: (input: unknown) => unknown | Promise<unknown>;
  }, options?: { signal?: AbortSignal }) => void | Promise<void>;
};

export function LessonLibrary({ lessons, initialDomain = "all", initialQuery = "" }: { lessons: GrammarLesson[]; initialDomain?: string; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [domain, setDomain] = useState(initialDomain);
  const [schoolBand, setSchoolBand] = useState("all");

  const visibleLessons = useMemo(() => filterLessons(lessons, query, domain, schoolBand), [lessons, query, domain, schoolBand]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContextShape }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "find_grammar_lessons",
        title: "문법 학습 자료 찾기",
        description: "검색어, 문법 영역, 학교급에 맞는 학습 자료를 화면에 필터링합니다.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "제목이나 개념 검색어" },
            domain: { type: "string", enum: ["all", ...GRAMMAR_DOMAINS] },
            schoolBand: { type: "string", enum: ["all", ...SCHOOL_BANDS] },
          },
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute(input) {
          if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("검색 조건은 객체여야 합니다.");
          const values = input as { query?: unknown; domain?: unknown; schoolBand?: unknown };
          if (values.query !== undefined && (typeof values.query !== "string" || values.query.length > 120)) throw new Error("검색어는 120자 이내의 문자열이어야 합니다.");
          if (values.domain !== undefined && (typeof values.domain !== "string" || !["all", ...GRAMMAR_DOMAINS].includes(values.domain as never))) {
            throw new Error("지원하지 않는 문법 영역입니다.");
          }
          if (values.schoolBand !== undefined && (typeof values.schoolBand !== "string" || !["all", ...SCHOOL_BANDS].includes(values.schoolBand as never))) {
            throw new Error("지원하지 않는 학교급입니다.");
          }
          const nextQuery = values.query ?? "";
          const nextDomain = values.domain ?? "all";
          const nextSchoolBand = values.schoolBand ?? "all";
          setQuery(nextQuery);
          setDomain(nextDomain);
          setSchoolBand(nextSchoolBand);
          const matches = filterLessons(lessons, nextQuery, nextDomain, nextSchoolBand);
          return { count: matches.length, lessons: matches.slice(0, 10).map((lesson) => ({ title: lesson.title, slug: lesson.slug })) };
        },
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch {
      return;
    }
    return () => lifecycle.abort();
  }, [lessons]);

  function resetFilters() {
    setQuery("");
    setDomain("all");
    setSchoolBand("all");
  }

  return (
    <section className="library-section" id="lesson-library" aria-labelledby="library-title">
      <div className="section-heading">
        <div><p>STUDENT LIBRARY</p><h2 id="library-title">출판된 학습 자료</h2><span>제목과 핵심 개념을 검색하거나 영역·학교급으로 좁혀 보세요.</span></div>
        <span className="result-count">{visibleLessons.length}개의 자료</span>
      </div>

      <div className="library-controls">
        <label className="library-search">
          <span className="sr-only">학습 자료 검색</span><Search aria-hidden="true" size={18} />
          <Input maxLength={120} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="제목 또는 개념 검색" type="search" />
        </label>
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger aria-label="문법 영역 선택" className="library-select"><SelectValue placeholder="모든 영역" /></SelectTrigger>
          <SelectContent><SelectItem value="all">모든 영역</SelectItem>{GRAMMAR_DOMAINS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={schoolBand} onValueChange={setSchoolBand}>
          <SelectTrigger aria-label="학교급 선택" className="library-select"><SelectValue placeholder="모든 학교급" /></SelectTrigger>
          <SelectContent><SelectItem value="all">모든 학교급</SelectItem>{SCHOOL_BANDS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {visibleLessons.length > 0 ? (
        <div className="lesson-grid">
          {visibleLessons.map((lesson) => (
            <Link className="lesson-card" href={`/lesson/${lesson.slug}`} key={`${lesson.id}-${lesson.slug}`}>
              <div className="lesson-meta"><span className={`lesson-category ${toneForDomain(lesson.domain)}`}>{lesson.domain}</span><small>{lesson.schoolBand}</small></div>
              <h3>{lesson.title}</h3><p>{lesson.summary}</p>
              <footer><span><BookOpenText aria-hidden="true" size={15} /> {lesson.curriculumCode || "개념 학습"}</span><span>읽기 <ArrowRight aria-hidden="true" size={14} /></span></footer>
            </Link>
          ))}
        </div>
      ) : (
        <div className="library-empty"><strong>조건에 맞는 자료가 아직 없어요.</strong><p>검색어를 줄이거나 모든 영역에서 다시 살펴보세요.</p><Button variant="outline" onClick={resetFilters}><RotateCcw /> 조건 지우기</Button></div>
      )}
    </section>
  );
}

function filterLessons(lessons: GrammarLesson[], query: string, domain: string, schoolBand: string) {
  const needle = query.trim().toLocaleLowerCase("ko-KR");
  return lessons.filter((lesson) => {
    const searchableText = [
      lesson.title,
      lesson.summary,
      lesson.domain,
      lesson.curriculumCode,
      lesson.content.concept,
      ...lesson.content.examples.flatMap((example) => [example.sentence, example.note]),
    ].join(" ").toLocaleLowerCase("ko-KR");
    const matchesQuery = !needle || searchableText.includes(needle);
    return matchesQuery && (domain === "all" || lesson.domain === domain) && (schoolBand === "all" || lesson.schoolBand === schoolBand);
  });
}

function toneForDomain(domain: string) {
  if (domain.includes("음운")) return "tone-sky";
  if (domain.includes("단어")) return "tone-green";
  if (domain.includes("문장")) return "tone-rose";
  if (domain.includes("담화")) return "tone-violet";
  if (domain.includes("역사")) return "tone-slate";
  return "tone-amber";
}
