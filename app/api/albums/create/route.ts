import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

type Body = {
  name?: string;
  passcode?: string;
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

  const name = payload.name?.trim();
  const passcode = payload.passcode?.trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!passcode || passcode.length < 4) {
    return NextResponse.json({ error: "Passcode must be at least 4 chars" }, { status: 400 });
  }

  const passcode_hash = await bcrypt.hash(passcode, 10);

  let code = generateCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.albums.findUnique({ where: { code } });
    if (!exists) break;
    code = generateCode();
  }

  const album = await prisma.albums.create({
    data: {
      name: name.slice(0, 120),
      passcode_hash,
      code,
    },
  });

  return NextResponse.json(
    {
      album: {
        id: album.id,
        code: album.code,
        name: album.name,
        created_at: album.created_at,
      },
    },
    { status: 201 },
  );
}
