import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resendVerification } from "@/services/auth/resend-verification.service";
import { ResendVerificationResult } from "@/types/resend-verification-result.type";
import { ResendVerificationRequest } from "@/types/resend-verification-request.type";
import { ResendVerificationKind} from "@/constants/resend-verification-kind.constant";
import type { User} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  let body:ResendVerificationRequest|null = null;
  let resendVerificationResult: ResendVerificationResult | null = null;
  let email:string|null = null;
  let emailUser: User|null = null;
  let userId: string|null = null;
  let resendVerificationKind:number = ResendVerificationKind.UNDEFINED;

  if(req){
    body = await req.json();
  }//req

  if(body){
    resendVerificationKind = body.resendVerificationKind;
    email = body.email;
  }//body

  if(typeof email === "string"){
    emailUser = await prisma.user.findUnique({
      where: { email },
    });
  }//rawEmail


  if(resendVerificationKind === ResendVerificationKind.REGISTER){
    if(session && session.user){
      userId = session.user.id;
    }//session
  }else if(resendVerificationKind === ResendVerificationKind.LOGIN){
    if(session && session.user){
      userId = session.user.id;
    }//session
  }else if(resendVerificationKind === ResendVerificationKind.MAIL_RESENDING){
    if(emailUser){
      userId = emailUser.id;
    }//emailUser
  }else if(resendVerificationKind === ResendVerificationKind.REQUEST_PASSWORD_RESET){
    if(emailUser){
      userId = emailUser.id;
    }//emailUser
  }//resendVerificationKind

  resendVerificationResult = await resendVerification(
    userId,
    resendVerificationKind,
  );


  return NextResponse.json(resendVerificationResult);
}
