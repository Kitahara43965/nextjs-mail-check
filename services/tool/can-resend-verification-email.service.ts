export function getCanResendVerificationEmailFromStringDate(stringDate:string|null): boolean {
  let canResendVerificationEmail:boolean = false;
  const now = Date.now();
  const EMAIL_RESEND_COOLDOWN_MILLISECOND
     = Number(process.env.EMAIL_RESEND_COOLDOWN_MILLISECOND ?? 60_000);
  let duration:number = 0;
  
  if(stringDate){
    duration = now - new Date(stringDate).getTime();
    if(duration >= EMAIL_RESEND_COOLDOWN_MILLISECOND){
      canResendVerificationEmail = true;
    }else{
      canResendVerificationEmail = false;
    }
  }else{
    canResendVerificationEmail = true;
  }

  return canResendVerificationEmail
}