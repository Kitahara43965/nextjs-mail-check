import { prisma } from "@/lib/prisma";
import { AuthTokenType } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const record = await prisma.authToken.findFirst({
    where: {
      token,
      authTokenType: AuthTokenType.PASSWORD_RESET,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return Response.json({ ok: false }, { status: 400 });
  }

  return Response.json({ ok: true });
}