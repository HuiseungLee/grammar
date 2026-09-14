"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  restoreSharedAuthSession,
  saveSharedAuthSession,
  type SharedAuthSession,
} from "@/lib/shared-auth";

type AuthMode = "login" | "signup" | "verify";
type SignupRole = "teacher" | "student";
type AuthConfig = { configured: boolean; url: string; key: string };
type SessionUser = { role?: SignupRole } | null;

export function SharedLogin({
  returnTo = "/studio",
  requiredRole,
  legacyLoginHref,
}: {
  returnTo?: string;
  requiredRole?: SignupRole;
  legacyLoginHref?: string;
}) {
  const [config, setConfig] = useState<AuthConfig>();
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<SignupRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [nickname, setNickname] = useState("");
  const [teacherInviteCode, setTeacherInviteCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function finishAuthentication(session: SharedAuthSession) {
    const response = await fetch("/api/auth/session", {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({ user: null })) as { user: SessionUser };
    if (data.user?.role && (!requiredRole || data.user.role === requiredRole)) {
      window.location.replace(returnTo);
      return;
    }
    if (data.user?.role === "student" && requiredRole === "teacher") {
      setMessage("로그인되었습니다. 편집실은 교사 계정만 이용할 수 있습니다.");
    }
  }

  useEffect(() => {
    let active = true;
    void fetch("/api/auth/config", { cache: "no-store" })
      .then((response) => response.json() as Promise<AuthConfig>)
      .then(async (nextConfig) => {
        if (!active) return;
        setConfig(nextConfig);
        if (!nextConfig.configured) return;
        const session = await restoreSharedAuthSession(nextConfig.url, nextConfig.key);
        if (session && active) await finishAuthentication(session);
      })
      .catch(() => active && setMessage("공통 로그인 설정을 불러오지 못했습니다."));
    return () => { active = false; };
    // Authentication restoration runs once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function authenticate(event: FormEvent) {
    event.preventDefault();
    if (!config?.configured) return setMessage("공통 로그인 설정이 아직 완료되지 않았습니다.");
    if (mode === "signup" && (!realName.trim() || !nickname.trim() || [...nickname.trim()].length > 7)) {
      return setMessage("이름과 7글자 이하 닉네임을 입력해 주세요.");
    }
    if (mode === "verify" && !/^\d{6}$/.test(verificationCode)) {
      return setMessage("이메일에 적힌 6자리 확인 코드를 입력해 주세요.");
    }

    setLoading(true);
    setMessage("");
    try {
      const response = mode === "signup"
        ? await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              role,
              realName: realName.trim(),
              nickname: nickname.trim(),
              teacherInviteCode,
            }),
          })
        : mode === "verify"
          ? await fetch(`${config.url}/auth/v1/verify`, {
              method: "POST",
              headers: { apikey: config.key, "Content-Type": "application/json" },
              body: JSON.stringify({ email: email.trim(), token: verificationCode, type: "email" }),
            })
          : await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
              method: "POST",
              headers: { apikey: config.key, "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload.error || payload.msg || payload.error_description || "인증하지 못했습니다."));
      if (mode === "signup" && !payload.access_token) {
        setMode("verify");
        setPassword("");
        setVerificationCode("");
        setMessage("가입 확인 메일을 보냈습니다. 이메일의 6자리 코드를 입력해 주세요.");
        return;
      }
      const session = saveSharedAuthSession(payload);
      await finishAuthentication(session);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "인증에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    if (!config?.configured || !email.trim()) return setMessage("가입 이메일을 입력해 주세요.");
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${config.url}/auth/v1/resend`, {
        method: "POST",
        headers: { apikey: config.key, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "signup", email: email.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload.error || payload.msg || "확인 코드를 다시 보내지 못했습니다."));
      setVerificationCode("");
      setMessage("새 확인 코드를 보냈습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "확인 코드를 다시 보내지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="studio-login-page">
      <section className="studio-login-card shared-auth-card" aria-labelledby="studio-login-title">
        <Link className="brand" href="/"><span>수니기는</span> 문법시간</Link>
        <div className="studio-login-icon" aria-hidden="true"><LockKeyhole /></div>
        <p className="eyebrow">LHSSTART ACCOUNT</p>
        <h1 id="studio-login-title">{mode === "signup" ? "계정 만들기" : mode === "verify" ? "이메일 확인" : "통합 로그인"}</h1>
        <p className="studio-login-copy">문학·문법·진로 사이트에서 함께 사용하는 계정입니다.</p>
        {message ? <p className="studio-login-error" role="alert">{message}</p> : null}
        <form onSubmit={authenticate}>
          {mode === "signup" ? <>
            <label htmlFor="signup-role">가입 유형</label>
            <select id="signup-role" value={role} onChange={(event) => setRole(event.target.value as SignupRole)}>
              <option value="student">학생</option><option value="teacher">교사</option>
            </select>
            {role === "teacher" ? <><label htmlFor="teacher-code">교사 초대 코드</label><input id="teacher-code" required type="password" value={teacherInviteCode} onChange={(event) => setTeacherInviteCode(event.target.value)} /></> : null}
            <label htmlFor="real-name">이름</label><input id="real-name" required value={realName} onChange={(event) => setRealName(event.target.value)} />
            <label htmlFor="nickname">닉네임 (최대 7글자)</label><input id="nickname" required maxLength={7} value={nickname} onChange={(event) => setNickname(event.target.value)} />
          </> : null}
          <label htmlFor="shared-email">이메일</label>
          <input id="shared-email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          {mode === "verify" ? <>
            <label htmlFor="verification-code">6자리 확인 코드</label>
            <input id="verification-code" required inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))} />
          </> : <><label htmlFor="shared-password">비밀번호</label><input id="shared-password" required minLength={6} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} /></>}
          <button type="submit" disabled={loading}>{loading ? "처리 중…" : mode === "signup" ? `${role === "teacher" ? "교사" : "학생"} 회원가입` : mode === "verify" ? "코드 확인하고 로그인" : "로그인"}</button>
          {mode === "verify" ? <button className="auth-secondary" type="button" disabled={loading} onClick={() => void resendVerification()}>확인 코드 다시 받기</button> : null}
          <button className="auth-secondary" type="button" onClick={() => { setMessage(""); setMode(mode === "login" ? "signup" : "login"); }}>{mode === "login" ? "회원가입으로 이동" : "로그인으로 돌아가기"}</button>
        </form>
        {legacyLoginHref ? <Link className="studio-login-back" href={legacyLoginHref}>기존 관리자 암호로 로그인</Link> : null}
        <Link className="studio-login-back" href="/">학습 사이트로 돌아가기</Link>
      </section>
    </main>
  );
}
