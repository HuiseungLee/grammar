import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionValue,
  isSynologyAdminConfigured,
  verifyAdminPassword,
} from "@/lib/editor-access";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSynologyAdminConfigured()) {
    return NextResponse.json(
      { error: "Synology 관리자 로그인이 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const password = formData.get("password");
  if (typeof password !== "string" || !(await verifyAdminPassword(password))) {
    return redirectWithinSite("/studio/login?auth=legacy&error=1");
  }

  const response = redirectWithinSite("/studio");
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: await createAdminSessionValue(),
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/",
    sameSite: "strict",
    secure: isHttpsRequest(request),
  });
  return response;
}

function isHttpsRequest(request: Request): boolean {
  const forwardedProtocol = request.headers.get("x-forwarded-proto")
    ?.split(",")[0]
    .trim();
  return forwardedProtocol === "https" || new URL(request.url).protocol === "https:";
}

function redirectWithinSite(path: string): NextResponse {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: path },
  });
}
