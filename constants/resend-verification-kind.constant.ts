import { AuthTokenType } from "@prisma/client";

export const ResendVerificationKind = {
  UNDEFINED: 0,
  REGISTER: 1,
  LOGIN: 2,
  MAIL_RESENDING:3,
  REQUEST_PASSWORD_RESET:4,
} as const;


export function getAuthTokenTypeFromResendVerificationKind(
  resendVerificationKind:number
):AuthTokenType{
  switch (resendVerificationKind) {
      case ResendVerificationKind.REGISTER:
        return AuthTokenType.EMAIL_VERIFICATION;
      case ResendVerificationKind.LOGIN:
        return AuthTokenType.EMAIL_VERIFICATION;
      case ResendVerificationKind.MAIL_RESENDING:
        return AuthTokenType.EMAIL_VERIFICATION;
      case ResendVerificationKind.REQUEST_PASSWORD_RESET:
        return AuthTokenType.PASSWORD_RESET;
      default:
        return AuthTokenType.UNDEFINED;
    }
}//getAuthTokenTypeFromResendVerificationKind


