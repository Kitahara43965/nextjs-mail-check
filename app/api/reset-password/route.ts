import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";
import { AuthTokenType } from "@prisma/client";
import type { Prisma,User, AuthToken } from "@prisma/client";

export async function POST(req: Request) {
  const { password, token } = await req.json();
  const hashed = hashPassword(password);
  let authTokenUserId:string|null = null;
  let authToken: Prisma.AuthTokenGetPayload<{
    include: { user: true }
  }> | null = null;

  // ① バリデーション
  if (typeof password !== "string" || password.length < 8) {
    return Response.json(
      { error: "パスワードは8文字以上です" },
      { status: 400 }
    );
  }

  if (typeof token !== "string" || !token) {
    return Response.json(
      { error: "トークンがありません" },
      { status: 400 }
    );
  }

  // ② トークン取得（複合条件なので findFirst）
  authToken = await prisma.authToken.findFirst({
    where: {
      token,
      authTokenType: AuthTokenType.PASSWORD_RESET,
    },
    include: {
      user: true,
    },
  });

  if(authToken){
    if(authToken.user){
      authTokenUserId = authToken.user.id;
    }//authToken.user

    if(typeof authTokenUserId === "string"){
      await prisma.user.update({
        where: {
          id: authTokenUserId,
        },
        data: {
          password: hashed,
        },
      });
    }//typeof authTokenUserId

    if(typeof authToken.id === "string"){
      await prisma.authToken.deleteMany({
        where: {
          id: authToken.id,
          authTokenType: AuthTokenType.PASSWORD_RESET,
        },
      });
    }//typeof authToken.id
  }else{//authToken
    return Response.json(
      { error: "無効なトークンです" },
      { status: 400 }
    );
  }//authToken

  return Response.json({
    success: true,
  });

}