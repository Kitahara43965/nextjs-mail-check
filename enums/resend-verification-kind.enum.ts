import { AuthTokenType } from "@prisma/client";

export enum ResendVerificationKind {
  UNDEFINED = "undefined",
  REGISTER = "register",
  LOGIN = "login",
  MAIL_RESENDING = "mail-resending",
  REQUEST_PASSWORD_RESET = "request-password-reset",
}


export function getAuthTokenTypeFromResendVerificationKind(
  resendVerificationKind:ResendVerificationKind
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