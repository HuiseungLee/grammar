import { redirect } from "next/navigation";
import { SharedLogin } from "@/components/shared-login";
import { getSharedUserFromCookies, isSharedAuthConfigured } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const params = await searchParams;
  const returnTo = safeReturnTo(firstParam(params.returnTo));
  if (!isSharedAuthConfigured()) redirect("/");
  if (await getSharedUserFromCookies()) redirect(returnTo);
  return <SharedLogin returnTo={returnTo} />;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeReturnTo(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//") && value.length <= 300 ? value : "/";
}
