import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/dashboard");

  if (!isProtected) return NextResponse.next();

  // ここで強い判定しない（重要）
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    console.log("middleware-url-to-login![login]");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}