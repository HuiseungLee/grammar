import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FilePenLine,
  LogIn,
  LogOut,
  Search,
  Sparkles,
} from "lucide-react";
import { LessonLibrary } from "@/components/lesson-library";
import {
  getGrammarEditorUser,
  grammarEditorEntryPath,
} from "@/lib/editor-access";
import { getPublishedLessons } from "@/lib/grammar-data";
import { GRAMMAR_DOMAINS } from "@/lib/lesson-types";
import { getSharedUserFromCookies, isSharedAuthConfigured } from "@/lib/supabase-auth";

const grammarAreas = [
  { mark: "音", title: "음운", domain: "음운·문자", description: "소리의 체계와 변동", topics: "음운 체계 · 교체 · 탈락 · 첨가 · 축약", tone: "sky" },
  { mark: "語", title: "단어", domain: "단어·품사", description: "형태소와 품사, 단어의 짜임", topics: "형태소 · 품사 · 파생어 · 합성어", tone: "green" },
  { mark: "文", title: "문장과 표현", domain: "문장·문법 요소", description: "문장의 구조와 문법 요소", topics: "문장 성분 · 문장의 짜임 · 높임 · 피동 · 사동", tone: "amber" },
  { mark: "準", title: "어문 규범", domain: "어문 규범·국어 생활", description: "맞춤법과 바른 국어 생활", topics: "맞춤법 · 띄어쓰기 · 표준 발음", tone: "rose" },
  { mark: "義", title: "의미와 담화", domain: "담화·의미", description: "말의 의미와 맥락", topics: "단어의 의미 · 담화 · 지시와 접속", tone: "violet" },
  { mark: "古", title: "국어사", domain: "국어의 역사", description: "우리말의 역사와 변화", topics: "훈민정음 · 중세 국어 · 근대 국어", tone: "slate" },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ domain?: string | string[]; q?: string | string[] }> }) {
  const [params, lessons, editor, account] = await Promise.all([
    searchParams,
    getPublishedLessons(),
    getGrammarEditorUser(),
    getSharedUserFromCookies(),
  ]);
  const sharedLoginEnabled = isSharedAuthConfigured();
  const requestedDomain = firstParam(params.domain);
  const domain = requestedDomain && GRAMMAR_DOMAINS.includes(requestedDomain as (typeof GRAMMAR_DOMAINS)[number]) ? requestedDomain : "all";
  const q = (firstParam(params.q) ?? "").slice(0, 120);
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/"><span>수니기는</span> 문법시간</Link>
        <nav aria-label="주요 메뉴">
          <Link href="#grammar-map">문법 지도</Link>
          <Link href="#lesson-library">학습 자료</Link>
          {editor ? <Link className="studio-link" href="/studio"><FilePenLine aria-hidden="true" size={16} /> 편집실</Link> : account?.role === "student" ? null : <a className="studio-link" href={grammarEditorEntryPath("/studio")} target="_top"><FilePenLine aria-hidden="true" size={16} /> 편집실</a>}
          {account ? <form action="/api/studio/logout" method="post" className="account-session"><span>{account.displayName}</span><button type="submit"><LogOut aria-hidden="true" size={15} /> 로그아웃</button></form> : sharedLoginEnabled ? <Link className="account-login" href="/login"><LogIn aria-hidden="true" size={15} /> 로그인</Link> : null}
          <a className="portal-link" href="https://lhsstart.synology.me">국어시간 홈</a>
        </nav>
      </header>

      <section className="search-stage" aria-labelledby="page-title">
        <div className="stage-grid">
          <div>
            <p className="eyebrow">KOREAN GRAMMAR ARCHIVE</p>
            <h1 id="page-title">문법의 원리를<br />차근차근 이해해요.</h1>
            <p>외울 목록보다 문장이 움직이는 원리를 찾습니다. 개념을 읽고, 예문에 표시하고, 바로 확인해 보세요.</p>
          </div>
          <form className="grammar-search" action="#lesson-library">
            <label htmlFor="grammar-query">어떤 문법 개념이 궁금한가요?</label>
            <div>
              <Search aria-hidden="true" size={20} />
              <input defaultValue={q} id="grammar-query" maxLength={120} name="q" placeholder="예: 음운 변동, 보조사, 안은문장" type="search" />
              <button type="submit" aria-label="문법 자료 검색">찾아보기</button>
            </div>
            <p>많이 찾는 개념: 음운의 변동 · 품사 · 문장 성분</p>
          </form>
        </div>
      </section>

      <section className="grammar-map" id="grammar-map" aria-labelledby="map-title">
        <div className="section-heading">
          <div>
            <p>GRAMMAR MAP</p>
            <h2 id="map-title">문법 지도</h2>
            <span>영역을 고르면 관련 개념과 새로 출판된 자료를 모아 볼 수 있습니다.</span>
          </div>
          <Link className="text-action" href="#lesson-library">자료 전체 보기 <ArrowRight aria-hidden="true" size={17} /></Link>
        </div>
        <div className="area-grid">
          {grammarAreas.map((area) => (
            <Link className={`area-card tone-${area.tone}`} href={`/?domain=${encodeURIComponent(area.domain)}#lesson-library`} key={area.title}>
              <span className="area-mark" aria-hidden="true">{area.mark}</span>
              <span className="area-copy"><strong>{area.title}</strong><b>{area.description}</b><small>{area.topics}</small></span>
              <ChevronRight className="area-arrow" aria-hidden="true" size={19} />
            </Link>
          ))}
        </div>
      </section>

      <section className="focus-section" aria-labelledby="focus-title">
        <div className="focus-copy">
          <p className="eyebrow">TODAY&apos;S GRAMMAR</p>
          <span className="category-chip">음운 · 교체</span>
          <h2 id="focus-title">‘국물’은 왜<br />[궁물]로 소리 날까요?</h2>
          <p>받침 ‘ㄱ’ 뒤에 비음 ‘ㅁ’이 오면 ‘ㄱ’이 같은 자리에서 나는 비음 ‘ㅇ’으로 바뀝니다. 이것이 비음화예요.</p>
          <Link className="primary-action" href="/lesson/nasalization">5분 개념 학습 <ArrowRight aria-hidden="true" size={18} /></Link>
        </div>
        <div className="sound-board" aria-label="국물이 궁물로 발음되는 과정">
          <div className="board-topline"><span>표준 발음으로 읽기</span><Sparkles aria-hidden="true" size={17} /></div>
          <div className="sound-change">
            <div><small>표기</small><strong>국물</strong></div><ArrowRight aria-hidden="true" size={26} />
            <div className="sound-result"><small>발음</small><strong>[궁물]</strong></div>
          </div>
          <div className="rule-line"><span>ㄱ</span><b>+</b><span>ㅁ</span><b>→</b><span className="changed">ㅇ</span><b>+</b><span>ㅁ</span></div>
          <ul>
            <li><CheckCircle2 aria-hidden="true" size={17} /> 앞 음절의 받침이 ‘ㄱ’</li>
            <li><CheckCircle2 aria-hidden="true" size={17} /> 뒤 음절의 첫소리가 비음 ‘ㅁ’</li>
          </ul>
        </div>
      </section>

      <LessonLibrary key={`${domain}-${q}`} lessons={lessons} initialDomain={domain} initialQuery={q} />

      <footer className="site-footer">
        <div><strong>수니기는 문법시간</strong><span>국어 문법의 원리를 함께 발견하는 학습 공간</span></div>
        <a href="https://lhsstart.synology.me">수니기는 국어시간</a>
      </footer>
    </main>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
