import { Session } from "next-auth";
import type {User} from "@prisma/client";

export function getCanResendVerificationEmailFromStringDate(
  stringDate:string
): boolean {
  let canResendVerificationEmail:boolean = false;
  const now = Date.now();
  const EMAIL_RESEND_COOLDOWN_MILLISECOND
     = Number(process.env.EMAIL_RESEND_COOLDOWN_MILLISECOND ?? 60_000);
  let duration:number = 0;
  
  duration = now - new Date(stringDate).getTime();
  if(duration >= EMAIL_RESEND_COOLDOWN_MILLISECOND){
    canResendVerificationEmail = true;
  }else{
    canResendVerificationEmail = false;
  }

  return canResendVerificationEmail
}


