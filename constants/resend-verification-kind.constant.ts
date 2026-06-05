import { AuthTokenType } from "@prisma/client";

export const ResendVerificationKind = {
  UNDEFINED: 0,
  REGISTER: 1,
  LOGIN: 2,
  CHECK_VERIFICATION: 3,
  MAIL_RESENDING:4,
  DASHBOARD:5,
  REQUEST_PASSWORD_RESET:6,
} as const;


export function getAuthTokenTypeFromResendVerificationKind(
  resendVerificationKind:number
):AuthTokenType{
  switch (resendVerificationKind) {
      case ResendVerificationKind.REGISTER:
        return AuthTokenType.EMAIL_VERIFICATION;
      case ResendVerificationKind.LOGIN:
        return AuthTokenType.EMAIL_VERIFICATION;
      case ResendVerificationKind.CHECK_VERIFICATION:
        return AuthTokenType.EMAIL_VERIFICATION;
      case ResendVerificationKind.MAIL_RESENDING:
        return AuthTokenType.EMAIL_VERIFICATION;
      case ResendVerificationKind.DASHBOARD:
        return AuthTokenType.EMAIL_VERIFICATION;
      case ResendVerificationKind.REQUEST_PASSWORD_RESET:
        return AuthTokenType.PASSWORD_RESET;
      default:
        return AuthTokenType.UNDEFINED;
    }
}//getAuthTokenTypeFromResendVerificationKind


