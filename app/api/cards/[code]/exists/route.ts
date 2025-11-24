import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const resolved = await params;
  const code = resolved.code?.trim();
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const card = await prisma.cards.findUnique({
    where: { code },
    select: { id: true, code: true },
  });

  if (!card) {
    return NextResponse.json({ exists: false }, { status: 404 });
  }

  return NextResponse.json({ exists: true, code: card.code });
}
