import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/editor-access";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "strict",
  });
  return response;
}
