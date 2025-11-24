import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [cards, messages] = await Promise.all([
      prisma.cards.count(),
      prisma.messages.count(),
    ]);

    return NextResponse.json({ cards, messages });
  } catch (err) {
    console.error("Failed to load stats", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
