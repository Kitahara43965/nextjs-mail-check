import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  const isDashboard = pathname.startsWith("/dashboard");

  // ① 未ログインはログインへ（これだけmiddlewareでやる）
  if (!token && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ② ログイン済みは login/register に行かせない
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ③ それ以外は通す
  return NextResponse.next();
}