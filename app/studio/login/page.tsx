import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { chatGPTSignInPath } from "@/app/chatgpt-auth";
import { SharedLogin } from "@/components/shared-login";
import {
  getGrammarEditorUser,
  isSynologyAdminConfigured,
} from "@/lib/editor-access";
import { isSharedAuthConfigured } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

export default async function StudioLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string | string[]; error?: string | string[] }>;
}) {
  if (!isSharedAuthConfigured() && !isSynologyAdminConfigured()) {
    redirect(chatGPTSignInPath("/studio"));
  }

  const editor = await getGrammarEditorUser();
  if (editor) redirect("/studio");
  const params = await searchParams;
  const legacyRequested = firstParam(params.auth) === "legacy";
  if (isSharedAuthConfigured() && (!legacyRequested || !isSynologyAdminConfigured())) {
    return <SharedLogin requiredRole="teacher" legacyLoginHref={isSynologyAdminConfigured() ? "/studio/login?auth=legacy" : undefined} />;
  }
  const hasError = firstParam(params.error) === "1";

  return (
    <main className="studio-login-page">
      <section className="studio-login-card" aria-labelledby="studio-login-title">
        <a className="brand" href="/"><span>수니기는</span> 문법시간</a>
        <div className="studio-login-icon" aria-hidden="true"><LockKeyhole /></div>
        <p className="eyebrow">TEACHER STUDIO</p>
        <h1 id="studio-login-title">문법 편집실</h1>
        <p className="studio-login-copy">관리자 암호를 입력하면 학습 자료를 작성하고 바로 출판할 수 있습니다.</p>
        <form action="/api/studio/session" method="post">
          <label htmlFor="admin-password">관리자 암호</label>
          <input
            autoComplete="current-password"
            autoFocus
            id="admin-password"
            maxLength={256}
            name="password"
            required
            type="password"
          />
          {hasError ? <p className="studio-login-error" role="alert">암호가 맞지 않습니다.</p> : null}
          <button type="submit">편집실 들어가기</button>
        </form>
        <a className="studio-login-back" href="/">학습 사이트로 돌아가기</a>
      </section>
    </main>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
