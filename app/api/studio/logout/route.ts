import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/editor-access";
import { SHARED_AUTH_COOKIE_NAME } from "@/lib/shared-auth";

export async function POST() {
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: "/" },
  });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "strict",
  });
  response.headers.append(
    "Set-Cookie",
    `${SHARED_AUTH_COOKIE_NAME}=; Path=/; Domain=lhsstart.synology.me; Max-Age=0; SameSite=Lax; Secure`,
  );
  return response;
}
