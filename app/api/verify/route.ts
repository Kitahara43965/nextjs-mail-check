import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AuthTokenType } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";


  if (!token) {
    return NextResponse.redirect(`${baseUrl}/verify`);
  }

  const authToken = await prisma.authToken.findFirst({
    where: {
      token,
      authTokenType: AuthTokenType.EMAIL_VERIFICATION,
    },
  });

  if (!authToken) {
    return NextResponse.redirect(`${baseUrl}/verify?reason=invalid`);
  }

  if (!authToken.expiresAt){
    
  }else if(authToken.expiresAt < new Date()) {
    return NextResponse.redirect(`${baseUrl}/verify?reason=expired`);
  }

  await prisma.user.update({
    where: { id: authToken.userId },
    data: {
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.authToken.deleteMany({
    where: {
      userId: authToken.userId,
      authTokenType: AuthTokenType.EMAIL_VERIFICATION,
    },
  });

  return NextResponse.redirect(`${baseUrl}/dashboard`);
}