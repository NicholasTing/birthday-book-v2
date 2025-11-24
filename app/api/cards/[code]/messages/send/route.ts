import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Body = {
  author?: string;
  message?: string;
  gif?: string;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params;
  const code = rawCode?.trim();
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  let payload: Body;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const author = payload.author?.trim() || "Anon";
  const body = payload.message?.trim();
  const gif = payload.gif?.trim();

  if (!body) {
    return NextResponse.json(
      { error: "Message text is required" },
      { status: 400 },
    );
  }

  const card = await prisma.cards.findUnique({ where: { code } });
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const message = await prisma.messages.create({
    data: {
      card_id: card.id,
      author: author.slice(0, 80),
      message: body.slice(0, 5000),
      gif: gif ? gif.slice(0, 2048) : null,
    },
  });

  return NextResponse.json(
    {
      message: {
        id: message.id,
        author: message.author,
        message: message.message,
        gif: message.gif,
        created_at: message.created_at,
      },
    },
    { status: 201 },
  );
}
