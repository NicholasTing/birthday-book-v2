import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

type Body = {
  albumId?: string;
  passcode?: string;
  cardCode?: string;
  year?: number;
};

export async function POST(req: Request) {
  let payload: Body;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const albumId = payload.albumId?.trim();
  const passcode = payload.passcode?.trim();
  const cardCode = payload.cardCode?.trim();
  const year = payload.year ?? null;

  if (!albumId || !passcode || !cardCode) {
    return NextResponse.json({ error: "albumId, passcode, and cardCode are required" }, { status: 400 });
  }

  const album = await prisma.albums.findUnique({
    where: { id: albumId },
  });
  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(passcode, album.passcode_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }

  const card = await prisma.cards.findUnique({
    where: { code: cardCode },
  });
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const link = await prisma.album_cards.upsert({
    where: {
      album_id_card_id: {
        album_id: album.id,
        card_id: card.id,
      },
    },
    update: {
      year_label: year ?? undefined,
    },
    create: {
      album_id: album.id,
      card_id: card.id,
      year_label: year,
    },
    include: {
      card: true,
    },
  });

  return NextResponse.json(
    {
      added: {
        albumId: album.id,
        cardCode: card.code,
        year: link.year_label,
      },
    },
    { status: 201 },
  );
}
