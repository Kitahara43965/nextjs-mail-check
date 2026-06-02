import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resendVerification } from "@/services/auth/resend-verification.service";
import { ResendVerificationResult } from "@/types/resend-verification-result.type";
import { 
  ResendVerificationKind,
  getResendVerificationUserKindFromResendVerificationKind 
} from "@/constants/resend-verification-kind.constant";
import { ResendVerificationUserKind } from "@/constants/resend-verification-user-kind.constant";
import type { User, AuthToken } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
  let resendVerificationUserKind:number = ResendVerificationUserKind.UNDEFINED;

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

  resendVerificationUserKind = 
    getResendVerificationUserKindFromResendVerificationKind(
      resendVerificationKind
    );
    
  if(resendVerificationUserKind === ResendVerificationUserKind.SESSION){
    if(session){
      userId = session.user.id;
    }//session
  }else if(resendVerificationUserKind === ResendVerificationUserKind.EMAIL){
    if(emailUser){
      userId = emailUser.id;
    }//emailUser
  }//resendVerificationUserKind
  
  resendVerificationResult = await resendVerification(
    userId,
    resendVerificationKind,
  );

  return Response.json(resendVerificationResult);
}
