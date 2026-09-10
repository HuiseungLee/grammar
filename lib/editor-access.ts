import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";

export async function isGrammarEditor(user: ChatGPTUser): Promise<boolean> {
  const configuredIds = env.EDITOR_ACCOUNT_USER_IDS?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];
  if (configuredIds.length > 0) return configuredIds.includes(user.userId);

  const host = (await headers()).get("host")?.split(":")[0] ?? "";
  return host === "localhost" || host === "127.0.0.1";
}

export async function requireGrammarEditor(returnTo = "/studio"): Promise<ChatGPTUser> {
  const user = await requireChatGPTUser(returnTo);
  if (!(await isGrammarEditor(user))) redirect("/?studio=restricted");
  return user;
}
