import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpenCheck, Brackets, CircleDot, GitCompareArrows } from "lucide-react";
import { LessonPractice } from "@/components/lesson-practice";
import { isGrammarEditor } from "@/lib/editor-access";
import { getLessonBySlug } from "@/lib/grammar-data";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";

type LessonPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  const url = `/lesson/${slug}`;
  return lesson ? {
    title: `${lesson.title} | 수니기는 문법시간`,
    description: lesson.summary,
    alternates: { canonical: url },
    openGraph: { title: lesson.title, description: lesson.summary, url, locale: "ko_KR", type: "article" },
  } : { title: "자료를 찾을 수 없습니다" };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const [{ slug }, user] = await Promise.all([params, getChatGPTUser()]);
  const lesson = await getLessonBySlug(slug);
  if (!lesson) notFound();
  const editor = user ? await isGrammarEditor(user) : false;

  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/"><span>수니기는</span> 문법시간</Link>
        <nav aria-label="주요 메뉴"><Link href="/#grammar-map">문법 지도</Link><Link href="/#lesson-library">학습 자료</Link>{editor ? <Link className="studio-link" href="/studio">편집실</Link> : !user ? <a className="studio-link" href={chatGPTSignInPath("/studio")} target="_top">편집실</a> : null}</nav>
      </header>

      <div className="lesson-shell">
        <Link className="back-link" href="/#lesson-library"><ArrowLeft aria-hidden="true" size={17} /> 학습 자료로 돌아가기</Link>
        <article className="lesson-paper">
          <header className="lesson-hero">
            <div className="lesson-kicker"><span>{lesson.domain}</span><b>{lesson.schoolBand}</b></div>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
            <div className="lesson-meta-line"><span>{lesson.curriculumCode || "개념 학습"}</span><span>{formatDate(lesson.publishedAt)}</span></div>
          </header>

          <div className="lesson-layout">
            <aside className="lesson-rail" aria-label="이 자료의 차례">
              <a href="#opening">첫 문장</a><a href="#concept">핵심 개념</a><a href="#analysis">문장 해부</a><a href="#compare">헷갈림 비교</a><a href="#check">확인 문제</a>
            </aside>
            <div className="lesson-content">
              <section id="opening" className="lesson-block opening-block">
                <div className="block-title"><CircleDot aria-hidden="true" /><span>첫 문장</span></div>
                <blockquote>{lesson.content.opening}</blockquote><p>{lesson.content.openingNote}</p>
              </section>

              <section id="concept" className="lesson-block">
                <div className="block-title"><BookOpenCheck aria-hidden="true" /><span>핵심 개념</span></div>
                <p className="concept-copy">{lesson.content.concept}</p>
              </section>

              <section id="analysis" className="lesson-block">
                <div className="block-title"><Brackets aria-hidden="true" /><span>문장 해부</span></div>
                <h2>{lesson.content.analysisTitle}</h2>
                <ol className="analysis-list">{lesson.content.analysisSteps.filter(Boolean).map((step, index) => <li key={`${step}-${index}`}><b>{String(index + 1).padStart(2, "0")}</b><span>{step}</span></li>)}</ol>
                <div className="example-list">{lesson.content.examples.filter((example) => example.sentence).map((example, index) => <div key={`${example.sentence}-${index}`}><strong>{example.sentence}</strong><span>{example.note}</span></div>)}</div>
              </section>

              <section id="compare" className="lesson-block">
                <div className="block-title"><GitCompareArrows aria-hidden="true" /><span>헷갈림 비교</span></div>
                <div className="compare-note"><h2>같아 보여도 판별 기준은 달라요.</h2><p>{lesson.content.comparison}</p></div>
              </section>

              <section id="check" className="lesson-block">
                <div className="block-title"><BookOpenCheck aria-hidden="true" /><span>확인 문제</span></div>
                <LessonPractice practice={lesson.content.practice} />
              </section>

              <footer className="lesson-end"><span>개념을 이해했다면 다른 예문에서도 같은 판별 기준을 적용해 보세요.</span><Link href="/#lesson-library">다음 자료 고르기 <ArrowRight aria-hidden="true" size={16} /></Link></footer>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

function formatDate(value: string | null) {
  if (!value) return "초안";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(date);
}
