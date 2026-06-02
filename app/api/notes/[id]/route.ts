import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** ========= UPDATE ========= */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const updated = await prisma.note.updateMany({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Note not found or forbidden" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}

/** ========= DELETE ========= */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await prisma.note.deleteMany({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: "Note not found or forbidden" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}