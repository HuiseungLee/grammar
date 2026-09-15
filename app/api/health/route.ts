import { env } from "cloudflare:workers";
import { accountServiceAvailable } from "@/lib/supabase-auth";

export async function GET() {
  try {
    const [database, accountService] = await Promise.all([
      env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>(),
      accountServiceAvailable(),
    ]);
    if (database?.ok !== 1) throw new Error("Database check failed");
    return Response.json({
      status: accountService ? "ok" : "degraded",
      database: true,
      accountService,
    });
  } catch {
    return Response.json(
      { status: "unavailable", database: false, accountService: false },
      { status: 503 },
    );
  }
}
