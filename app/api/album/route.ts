import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  let body: { albumCode?: string; passcode?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const albumCode = body.albumCode?.trim();
  const passcode = body.passcode?.trim();

  if (!albumCode || !passcode) {
    return NextResponse.json(
      { error: "albumCode and passcode are required" },
      { status: 400 },
    );
  }

  const album = await prisma.albums.findUnique({
    where: { code: albumCode },
    include: {
      cards: {
        include: { card: true },
        orderBy: { added_at: "desc" },
      },
    },
  });

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  let valid = false;
  try {
    valid = await bcrypt.compare(passcode, album.passcode_hash);
  } catch {
    valid = false;
  }
  if (!valid) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }

  const cards = album.cards.map((entry) => ({
    cardId: entry.card_id,
    code: entry.card.code,
    recipient: entry.card.recipient,
    occasion: entry.card.occasion,
    created_at: entry.card.created_at,
    added_at: entry.added_at,
  }));

  return NextResponse.json({
    album: {
      id: album.id,
      code: album.code,
      name: album.name,
      created_at: album.created_at,
    },
    cards,
  });
}
