import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

type Body = {
  recipient?: string;
  occasion?: string;
  custom_message?: string;
  code?: string;
};

function generateCode() {
  return randomBytes(4).toString("hex").slice(0, 6);
}

export async function POST(req: Request) {
  let payload: Body;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const recipient = payload.recipient?.trim() || "Someone special";
  const custom_message = payload.custom_message?.trim() || null;
  const requestedCode = payload.code?.trim();

  const occasionValue = payload.occasion?.trim() || "Other";

  let code = requestedCode || generateCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.cards.findUnique({ where: { code } });
    if (!exists) break;
    code = generateCode();
  }

  const card = await prisma.cards.create({
    data: {
      code,
      recipient: recipient.slice(0, 120),
      occasion: occasionValue.slice(0, 120),
      custom_message: custom_message ? custom_message.slice(0, 500) : null,
    },
  });

  return NextResponse.json(
    {
      card: {
        id: card.id,
        code: card.code,
        recipient: card.recipient,
        occasion: card.occasion,
        custom_message: card.custom_message,
        created_at: card.created_at,
      },
    },
    { status: 201 },
  );
}
