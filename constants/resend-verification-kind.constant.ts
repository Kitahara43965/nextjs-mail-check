import { AuthTokenType } from "@prisma/client";
import { ResendVerificationUserKind } from "@/constants/resend-verification-user-kind.constant";

export const ResendVerificationKind = {
  UNDEFINED: 0,
  REGISTER: 1,
  LOGIN: 2,
  CHECK_VERIFICATION: 3,
  MAIL_RESENDING:4,
  REQUEST_PASSWORD_RESET:5,
} as const;


export function getResendVerificationUserKindFromResendVerificationKind(
  resendVerificationKind:number
):number{
    switch (resendVerificationKind) {
      case ResendVerificationKind.REGISTER:
        return ResendVerificationUserKind.SESSION;
      case ResendVerificationKind.LOGIN:
        return ResendVerificationUserKind.SESSION;
      case ResendVerificationKind.CHECK_VERIFICATION:
        return ResendVerificationUserKind.SESSION;
      case ResendVerificationKind.MAIL_RESENDING:
        return ResendVerificationUserKind.SESSION;
      case ResendVerificationKind.REQUEST_PASSWORD_RESET:
        return ResendVerificationUserKind.EMAIL;
      default:
        return ResendVerificationUserKind.UNDEFINED;
    }
}//getAuthTokenTypeFromResendVerificationKind


