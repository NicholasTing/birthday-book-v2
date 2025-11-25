import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

type Params = Promise<{ id: string }>;

async function fetchAlbumWithCards(idOrCode: string) {
  const lookup = idOrCode.toUpperCase();
  return (
    (await prisma.albums.findUnique({
      where: { id: idOrCode },
      include: {
        cards: { include: { card: true }, orderBy: { added_at: "desc" } },
      },
    })) ||
    (await prisma.albums.findUnique({
      where: { code: lookup },
      include: {
        cards: { include: { card: true }, orderBy: { added_at: "desc" } },
      },
    }))
  );
}

async function respond(idOrCode: string, passcode?: string | null) {
  if (!passcode) {
    return NextResponse.json({ error: "Passcode required" }, { status: 400 });
  }

  const album = await fetchAlbumWithCards(idOrCode);
  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  if (!album.passcode_hash) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
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

  const cards = album.cards.map((entry: any) => ({
    cardId: entry.card_id,
    code: entry.card.code,
    recipient: entry.card.recipient,
    occasion: entry.card.occasion,
    year: null,
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

export async function GET(
  req: Request,
  { params }: { params: Params },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const passcode = url.searchParams.get("passcode")?.trim();
  try {
    return await respond(id, passcode);
  } catch (err) {
    console.error("Album view error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Params },
) {
  const { id } = await params;
  let passcode: string | null = null;
  try {
    const body = await req.json();
    passcode = typeof body?.passcode === "string" ? body.passcode.trim() : null;
  } catch {
    passcode = null;
  }
  try {
    return await respond(id, passcode);
  } catch (err) {
    console.error("Album view error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
