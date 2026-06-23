import { sendVerificationEmail } from "@/services/auth/draw/send-verification-email.service";
import { prisma} from "@/lib/prisma";
import { AuthTokenType } from "@prisma/client";
import crypto from "crypto";
import {ResendVerificationKind} from "@/enums/resend-verification-kind.enum";


export async function issueEmailVerificationToken(
  userId: string,
  email: string,
  resendVerificationKind: ResendVerificationKind,
  authTokenType:AuthTokenType,
) {
  const token = crypto.randomBytes(32).toString("hex");

  if(authTokenType !== AuthTokenType.UNDEFINED){
    await prisma.authToken.deleteMany({
      where: {
        userId,
        authTokenType,
      },
    });

    const result = await prisma.authToken.create({
      data: {
        userId,
        token,
        authTokenType,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    await sendVerificationEmail(email, token,authTokenType);

  }//authTokenType


  
}