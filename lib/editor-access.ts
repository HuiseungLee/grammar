import { env } from "cloudflare:workers";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  chatGPTSignInPath,
  getChatGPTUser,
  requireChatGPTUser,
  type ChatGPTUser,
} from "@/app/chatgpt-auth";

export const ADMIN_SESSION_COOKIE = "grammar_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

export type GrammarEditorUser = ChatGPTUser & {
  authKind: "chatgpt" | "synology";
};

export function isSynologyAdminConfigured(): boolean {
  return Boolean(env.GRAMMAR_ADMIN_PASSWORD && env.GRAMMAR_SESSION_SECRET);
}

export function grammarEditorEntryPath(returnTo = "/studio"): string {
  return isSynologyAdminConfigured()
    ? "/studio/login"
    : chatGPTSignInPath(returnTo);
}

export async function isGrammarEditor(user: ChatGPTUser): Promise<boolean> {
  const configuredIds = env.EDITOR_ACCOUNT_USER_IDS?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];
  if (configuredIds.length > 0) return configuredIds.includes(user.userId);

  const host = (await headers()).get("host")?.split(":")[0] ?? "";
  return host === "localhost" || host === "127.0.0.1";
}

export async function getGrammarEditorUser(): Promise<GrammarEditorUser | null> {
  const chatGPTUser = await getChatGPTUser();
  if (chatGPTUser && (await isGrammarEditor(chatGPTUser))) {
    return { ...chatGPTUser, authKind: "chatgpt" };
  }

  if (isSynologyAdminConfigured() && (await hasValidAdminSession())) {
    return {
      userId: "synology-owner",
      displayName: "문법 관리자",
      email: "owner@grammar.local",
      fullName: "문법 관리자",
      authKind: "synology",
    };
  }

  return null;
}

export async function requireGrammarEditor(
  returnTo = "/studio",
): Promise<GrammarEditorUser> {
  const editor = await getGrammarEditorUser();
  if (editor) return editor;
  if (isSynologyAdminConfigured()) redirect("/studio/login");

  const user = await requireChatGPTUser(returnTo);
  if (!(await isGrammarEditor(user))) redirect("/?studio=restricted");
  return { ...user, authKind: "chatgpt" };
}

export async function verifyAdminPassword(candidate: string): Promise<boolean> {
  const expected = env.GRAMMAR_ADMIN_PASSWORD;
  if (!expected || candidate.length < 1 || candidate.length > 256) return false;

  const [candidateHash, expectedHash] = await Promise.all([
    digest(candidate),
    digest(expected),
  ]);
  let difference = 0;
  for (let index = 0; index < candidateHash.length; index += 1) {
    difference |= candidateHash[index] ^ expectedHash[index];
  }
  return difference === 0;
}

export async function createAdminSessionValue(): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  return `${expiresAt}.${await sign(String(expiresAt))}`;
}

async function hasValidAdminSession(): Promise<boolean> {
  const value = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!value) return false;

  const [expiresRaw, signature, extra] = value.split(".");
  if (!expiresRaw || !signature || extra) return false;

  const expiresAt = Number(expiresRaw);
  if (!Number.isInteger(expiresAt)) return false;
  if (expiresAt <= Math.floor(Date.now() / 1000)) return false;

  return constantTimeEqual(signature, await sign(expiresRaw));
}

async function digest(value: string): Promise<Uint8Array> {
  const result = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return new Uint8Array(result);
}

async function sign(value: string): Promise<string> {
  const secret = env.GRAMMAR_SESSION_SECRET;
  if (!secret) return "";

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return toBase64Url(new Uint8Array(signature));
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}
