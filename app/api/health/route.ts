import { env } from "cloudflare:workers";

export async function GET() {
  try {
    const database = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
    if (database?.ok !== 1) throw new Error("Database check failed");
    return Response.json({ status: "ok", database: true });
  } catch {
    return Response.json(
      { status: "unavailable", database: false },
      { status: 503 },
    );
  }
}
