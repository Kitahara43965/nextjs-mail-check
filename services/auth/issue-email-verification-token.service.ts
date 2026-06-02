import { sendVerificationEmail } from "@/services/auth/draw/send-verification-email.service";
import { prisma} from "@/lib/prisma";
import { AuthTokenType } from "@prisma/client";
import crypto from "crypto";
import type { User, AuthToken } from "@prisma/client";
import {getAuthTokens} from "@/services/tool/get-auth-tokens.service";


export async function issueEmailVerificationToken(
  userId: string,
  email: string,
  resendVerificationKind: number,
  authTokenType:AuthTokenType,
) {
  const token = crypto.randomBytes(32).toString("hex");

  if(authTokenType !== AuthTokenType.UNDEFINED){
    await prisma.$transaction(async (tx) => {
      await tx.authToken.deleteMany({
        where: {
          userId,
          authTokenType:authTokenType,
        },
      });

      await tx.authToken.create({
        data: {
          userId,
          token,
          authTokenType:authTokenType,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });
    });

    await sendVerificationEmail(email, token,authTokenType);

  }//authTokenType


  
}