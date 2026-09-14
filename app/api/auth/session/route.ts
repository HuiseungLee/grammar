import { getSharedUserFromRequest } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return Response.json({ user: await getSharedUserFromRequest(request) });
}
