import { prisma } from "@/lib/prisma";
import { ResendVerificationResult } from "@/types/resend-verification-result.type";
import type { User, AuthToken } from "@prisma/client";
import { issueEmailVerificationToken } from "@/services/auth/issue-email-verification-token.service";
import { ResendVerificationError } from "@/constants/resend-verification-error.constant";
import {ResendVerificationStatus} from "@/constants/resend-verification-status.constant";
import {ResendVerificationKind} from "@/constants/resend-verification-kind.constant";
import { AuthTokenType } from "@prisma/client";

export async function resendVerification(
  userId: string | null,
  resendVerificationKind: number,
): Promise<ResendVerificationResult> {
  const now = new Date();
  let user: User | null = null;
  let latestAuthToken: AuthToken | null = null;
  let emailVerificationSentTimeDuration = 0;
  let canResendVerificationEmail: boolean = false;
  let isVerificationMailSent: boolean = false;
  let resendVerificationError: string | null = ResendVerificationError.UNDEFINED;
  let resendVerificationStatus:string|null = ResendVerificationStatus.UNDEFINED;
  let resendVerificationResult: ResendVerificationResult | null = null;
  let issueEmailVerificationTokenMarker: number = 0;
  let authTokenType:AuthTokenType = AuthTokenType.UNDEFINED;

  if(resendVerificationKind === ResendVerificationKind.REGISTER) {
    authTokenType = AuthTokenType.EMAIL_VERIFICATION;
  }else if(resendVerificationKind === ResendVerificationKind.LOGIN){
    authTokenType = AuthTokenType.EMAIL_VERIFICATION;
  }else if(resendVerificationKind === ResendVerificationKind.CHECK_VERIFICATION){
    authTokenType = AuthTokenType.EMAIL_VERIFICATION;
  }else if(resendVerificationKind === ResendVerificationKind.MAIL_RESENDING){
    authTokenType = AuthTokenType.EMAIL_VERIFICATION;
  }else if(resendVerificationKind === ResendVerificationKind.REQUEST_PASSWORD_RESET){
    authTokenType = AuthTokenType.PASSWORD_RESET;
  }else{//resendVerificationKind
    authTokenType = AuthTokenType.UNDEFINED;
  }//resendVerificationKind

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

    if (user.emailVerifiedAt) {
      emailVerificationSentTimeDuration =
        now.getTime() - new Date(user.emailVerifiedAt).getTime();
      canResendVerificationEmail =
        emailVerificationSentTimeDuration >= 60 * 1000;
    } else {
      emailVerificationSentTimeDuration = 0;
      canResendVerificationEmail = true;
    } //user.emailVerifiedAt


    if (resendVerificationKind === ResendVerificationKind.REGISTER) {
      resendVerificationError = ResendVerificationError.UNDEFINED;
      resendVerificationStatus = ResendVerificationStatus.REGISTER;
      isVerificationMailSent = true;
      issueEmailVerificationTokenMarker = 1;
    } else if (resendVerificationKind === ResendVerificationKind.LOGIN) {
      if (canResendVerificationEmail === true) {
        resendVerificationError = ResendVerificationError.UNDEFINED;
        resendVerificationStatus = ResendVerificationStatus.LOGIN_CAN_RESEND_VERIFICATION_EMAIL;
        isVerificationMailSent = true;
        issueEmailVerificationTokenMarker = 2;
      } else {
        resendVerificationError = ResendVerificationError.UNDEFINED;
        resendVerificationStatus = ResendVerificationStatus.LOGIN_CANNOT_RESEND_VERIFICATION_EMAIL;
        isVerificationMailSent = false;
        issueEmailVerificationTokenMarker = 0;
      } //canResendVerificationEmail
    } else if (
      resendVerificationKind === ResendVerificationKind.CHECK_VERIFICATION
    ) {
      if (canResendVerificationEmail === true) {
        resendVerificationError = ResendVerificationError.UNDEFINED;
        resendVerificationStatus = ResendVerificationStatus.CHECK_VERIFICATION_CAN_RESEND_VERIFICATION_EMAIL;
        isVerificationMailSent = true;
        issueEmailVerificationTokenMarker = 0;
      } else {
        resendVerificationError = ResendVerificationError.UNDEFINED;
        resendVerificationStatus = ResendVerificationStatus.CHECK_VERIFICATION_CANNOT_RESEND_VERIFICATION_EMAIL;
        isVerificationMailSent = false;
        issueEmailVerificationTokenMarker = 0;
      } //emailVerificationSentTimeDuration
    }else if(resendVerificationKind === ResendVerificationKind.MAIL_RESENDING){
      resendVerificationError = ResendVerificationError.UNDEFINED;
      resendVerificationStatus = ResendVerificationStatus.MAIL_SENDING;
      isVerificationMailSent = true;
      issueEmailVerificationTokenMarker = 3;
    }else if(resendVerificationKind === ResendVerificationKind.REQUEST_PASSWORD_RESET){
      resendVerificationError = ResendVerificationError.UNDEFINED;
      resendVerificationStatus = ResendVerificationStatus.REQUEST_PASSWORD_RESET;
      isVerificationMailSent = true;
      issueEmailVerificationTokenMarker = 4;
    } else {
      resendVerificationError = ResendVerificationError.UNDEFINED;
      resendVerificationStatus = ResendVerificationStatus.ELSE;
      isVerificationMailSent = false;
      issueEmailVerificationTokenMarker = 0;
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
    isVerificationMailSent = false;
  } //shouldGoVerifyUser
  
  resendVerificationResult = {
    resendVerificationError: resendVerificationError,
    resendVerificationStatus: resendVerificationStatus,
    isVerificationMailSent: isVerificationMailSent,
  };

  return resendVerificationResult;
}
