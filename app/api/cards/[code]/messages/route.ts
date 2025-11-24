import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params;
  const code = rawCode?.trim();
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const card = await prisma.cards.findUnique({
    where: { code },
    include: {
      card_senders: { orderBy: { created_at: "desc" } },
    },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json({
    card: {
      id: card.id,
      code: card.code,
      recipient: card.recipient,
      occasion: card.occasion,
      custom_message: card.custom_message,
      created_at: card.created_at,
    },
    messages: card.card_senders.map((m: any) => ({
      id: m.id,
      author: m.author,
      message: m.message,
      gif: m.gif,
      created_at: m.created_at,
    })),
  });
}
