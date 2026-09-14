import { redirect } from "next/navigation";
import { SharedLogin } from "@/components/shared-login";
import { getSharedUserFromCookies, isSharedAuthConfigured } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!isSharedAuthConfigured()) redirect("/");
  if (await getSharedUserFromCookies()) redirect("/");
  return <SharedLogin returnTo="/" />;
}
