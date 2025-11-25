import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

type Params = Promise<{ id: string }>;

export async function GET(
  req: Request,
  { params }: { params: Params },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const passcode = url.searchParams.get("passcode")?.trim();

  if (!passcode) {
    return NextResponse.json({ error: "Passcode required" }, { status: 400 });
  }

  // Allow lookup by id or code
  const album =
    (await prisma.albums.findUnique({
      where: { id },
      include: {
        cards: {
          include: { card: true },
          orderBy: { added_at: "desc" },
        },
      },
    })) ||
    (await prisma.albums.findUnique({
      where: { code: id },
      include: {
        cards: {
          include: { card: true },
          orderBy: { added_at: "desc" },
        },
      },
    }));

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(passcode, album.passcode_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }

  const cards = album.cards.map((entry: any) => ({
    cardId: entry.card_id,
    code: entry.card.code,
    recipient: entry.card.recipient,
    occasion: entry.card.occasion,
    year: entry.year_label,
    added_at: entry.added_at,
  }));

  return NextResponse.json({
    album: {
      id: album.id,
      name: album.name,
      created_at: album.created_at,
    },
    cards,
  });
}
