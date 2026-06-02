import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";
import { RegisterErrors } from "@/types/auth";
import { resendVerification } from "@/services/auth/resend-verification.service";
import { ResendVerificationResult } from "@/types/resend-verification-result.type";
import { ResendVerificationKind } from "@/constants/resend-verification-kind.constant";

import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "ユーザー名を入力してください"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "パスワードが一致しません",
});

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = registerSchema.safeParse(body);
  let resendVerificationResult:ResendVerificationResult|null = null;

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return Response.json(
      {
        registerErrors: {
          name: errors.name?.[0],
          email: errors.email?.[0],
          password: errors.password?.[0],
          confirmPassword: errors.confirmPassword?.[0],
        },
      },
      { status: 400 }
    );
  }


  const { name, email, password } = parsed.data;

  const hashed = hashPassword(password);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return Response.json(
      {
        registerErrors: {
          email: "すでに登録されているメールアドレスです",
        },
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      loginTimeNumber: 0,

      userSetting: {
        create: {
          hasNotifyLoginEmail: true,
        },
      },
    },

    include: {
      userSetting: true,
    },
  });

  resendVerificationResult = await resendVerification(
    user.id,
    ResendVerificationKind.REGISTER,
  );

  return Response.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}
