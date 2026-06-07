import { prisma } from "@/lib/prisma";
import { ResendVerificationResult } from "@/types/resend-verification-result.type";
import type { User, AuthToken } from "@prisma/client";
import { issueEmailVerificationToken } from "@/services/auth/issue-email-verification-token.service";
import { ResendVerificationError } from "@/constants/resend-verification-error.constant";
import {ResendVerificationStatus} from "@/constants/resend-verification-status.constant";
import { 
  ResendVerificationKind,
  getAuthTokenTypeFromResendVerificationKind 
} from "@/constants/resend-verification-kind.constant";
import {getCanResendVerificationEmailFromStringDate} from "@/services/tool/can-resend-verification-email.service";
import { AuthTokenType } from "@prisma/client";

export async function resendVerification(
  userId: string | null,
  resendVerificationKind: number,
): Promise<ResendVerificationResult> {
  const now = new Date();
  let user: User | null = null;
  let latestAuthToken: AuthToken | null = null;
  let canResendVerificationEmail: boolean = false;
  let shouldGoVerify: boolean = false;
  let resendVerificationError: string | null = ResendVerificationError.UNDEFINED;
  let resendVerificationStatus:string|null = ResendVerificationStatus.UNDEFINED;
  let resendVerificationResult: ResendVerificationResult | null = null;
  let issueEmailVerificationTokenMarker: number = 0;
  let authTokenType:AuthTokenType = AuthTokenType.UNDEFINED;
  let stringEmailVerifiedAt:string|null = null;

  authTokenType = 
    getAuthTokenTypeFromResendVerificationKind(
      resendVerificationKind
    );

  if (userId) {
    user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  if (user) {
    latestAuthToken =
      await prisma.authToken.findFirst({
        where: {
           userId: user.id,
           authTokenType: authTokenType,
        },
        orderBy: { createdAt: "desc" },
      });

    if(user.emailVerifiedAt){
      stringEmailVerifiedAt = user.emailVerifiedAt.toISOString();
    }//user.emailVerifiedAt

    canResendVerificationEmail = getCanResendVerificationEmailFromStringDate(stringEmailVerifiedAt);

    if (resendVerificationKind === ResendVerificationKind.REGISTER) {
      resendVerificationError = ResendVerificationError.UNDEFINED;
      resendVerificationStatus = ResendVerificationStatus.REGISTER;
      issueEmailVerificationTokenMarker = 1;
      shouldGoVerify = true;
    } else if (resendVerificationKind === ResendVerificationKind.LOGIN) {
      resendVerificationError = ResendVerificationError.UNDEFINED;
      resendVerificationStatus = ResendVerificationStatus.LOGIN_CAN_RESEND_VERIFICATION_EMAIL;
      issueEmailVerificationTokenMarker = 2;
      shouldGoVerify = canResendVerificationEmail;
    } else if (
      resendVerificationKind === ResendVerificationKind.CHECK_VERIFICATION
    ) {
      resendVerificationError = ResendVerificationError.UNDEFINED;
      resendVerificationStatus = ResendVerificationStatus.CHECK_VERIFICATION_CAN_RESEND_VERIFICATION_EMAIL;
      issueEmailVerificationTokenMarker = 0;
      shouldGoVerify = canResendVerificationEmail;
    }else if(resendVerificationKind === ResendVerificationKind.MAIL_RESENDING){
      resendVerificationError = ResendVerificationError.UNDEFINED;
      resendVerificationStatus = ResendVerificationStatus.MAIL_RESENDING;
      issueEmailVerificationTokenMarker = 3;
      shouldGoVerify = true;
    }else if(resendVerificationKind === ResendVerificationKind.REQUEST_PASSWORD_RESET){
      resendVerificationError = ResendVerificationError.UNDEFINED;
      resendVerificationStatus = ResendVerificationStatus.REQUEST_PASSWORD_RESET;
      issueEmailVerificationTokenMarker = 4;
      shouldGoVerify = true;
    } else {
      resendVerificationError = ResendVerificationError.UNDEFINED;
      resendVerificationStatus = ResendVerificationStatus.ELSE;
      issueEmailVerificationTokenMarker = 0;
      shouldGoVerify = false;
    } //resendVerificationKind

    if (issueEmailVerificationTokenMarker !== 0) {
      await issueEmailVerificationToken(
        user.id,
        user.email,
        resendVerificationKind,
        authTokenType,
      );
    } //issueEmailVerificationTokenMarker&0

  } else {
    resendVerificationError = ResendVerificationError.NO_USER;
    resendVerificationStatus = ResendVerificationStatus.NO_USER;
    shouldGoVerify = false;
  } //shouldGoVerifyUser
  
  resendVerificationResult = {
    resendVerificationError: resendVerificationError,
    resendVerificationStatus: resendVerificationStatus,
    shouldGoVerify: shouldGoVerify,
  };

  return resendVerificationResult;
}
