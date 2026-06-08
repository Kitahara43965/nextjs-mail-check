import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resendVerification } from "@/services/auth/resend-verification.service";
import { ResendVerificationResult } from "@/types/resend-verification-result.type";
import { 
  ResendVerificationKind,
  getAuthTokenTypeFromResendVerificationKind 
} from "@/constants/resend-verification-kind.constant";
import type { User, AuthToken } from "@prisma/client";
import { AuthTokenType} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formDataResendVerification = await req.formData();
  const session = await getServerSession(authOptions);
  let resendVerificationResult: ResendVerificationResult | null = null;
  const stringRawResendVerificationKind = formDataResendVerification.get(
    "stringResendVerificationKind",
  );
  const rawEmail = formDataResendVerification.get(
    "email",
  );
  let stringResendVerificationKind:string|null = null;
  let email:string|null = null;
  let emailUser: User|null = null;
  let userId: string|null = null;
  let resendVerificationKind:number = ResendVerificationKind.UNDEFINED;
  let authTokenType:AuthTokenType = AuthTokenType.UNDEFINED;

  console.log("BugKiller");

  if (typeof stringRawResendVerificationKind === "string") {
    stringResendVerificationKind = stringRawResendVerificationKind;
    resendVerificationKind = Number(stringResendVerificationKind);
  } //stringResendVerificationKind

  if(typeof rawEmail === "string"){
    email = rawEmail;
    emailUser = await prisma.user.findUnique({
      where: { email },
    });
  }//rawEmail

  authTokenType = 
    getAuthTokenTypeFromResendVerificationKind(
      resendVerificationKind
    );
    
  if(authTokenType === AuthTokenType.EMAIL_VERIFICATION){
    if(session && session.user){
      userId = session.user.id;
    }//session
  }else if(authTokenType === AuthTokenType.PASSWORD_RESET){
    if(emailUser){
      userId = emailUser.id;
    }//emailUser
  }//authTokenType
  
  resendVerificationResult = await resendVerification(
    userId,
    resendVerificationKind,
  );

  return NextResponse.json(resendVerificationResult);
}
