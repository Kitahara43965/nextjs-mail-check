import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nullable, z } from "zod";

/** ========= validation ========= */
const noteSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  content: z.string().min(1, "内容を入力してください"),
});

/** ========= GET ========= */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized", data: null },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    error: null,
    notes,
  });
}

/** ========= POST ========= */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized", data: null },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON", data: null },
      { status: 400 }
    );
  }

  const result = noteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation Error",
        details: result.error.flatten().fieldErrors,
        data: null,
      },
      { status: 400 }
    );
  }

  const note = await prisma.note.create({
    data: {
      title: result.data.title,
      content: result.data.content,
      userId: session.user.id,
    },
  });

  return NextResponse.json({
    error: null,
    note: note,
  });
}