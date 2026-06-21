import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCanResendVerificationEmailFromStringDate } 
  from "@/services/tool/can-resend-verification-email.service";
import type { User} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  let user:User|null = null;
  let stringEmailVerifiedAt:string|null = null;
  let isLoggedIn:boolean = false;
  let canResendVerificationEmailFromStringDate:boolean = false;

  if(session){
    isLoggedIn = true;
    user = await prisma.user.findUnique({
        where:{
            id: session.user.id
        }
    });
  }//session

  if(user && user.emailVerifiedAt){
    stringEmailVerifiedAt = user.emailVerifiedAt.toISOString();
  }//user.emailVerifiedAt

  if(stringEmailVerifiedAt){
    canResendVerificationEmailFromStringDate
    = getCanResendVerificationEmailFromStringDate(stringEmailVerifiedAt);
  }else{//stringEmailVerifiedAt
    canResendVerificationEmailFromStringDate = true;
  }//stringEmailVerifiedAt


  return Response.json({
    isLoggedIn:isLoggedIn,
    canResendVerificationEmailFromStringDate: canResendVerificationEmailFromStringDate,
  });
}