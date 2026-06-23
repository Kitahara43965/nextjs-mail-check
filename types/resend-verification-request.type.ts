import { ResendVerificationKind } from "@/enums/resend-verification-kind.enum";

export type ResendVerificationRequest = {
  resendVerificationKind: ResendVerificationKind;
  email:string|null;
};
