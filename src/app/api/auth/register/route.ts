import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByPhone, createUser } from "@/lib/users";
import { createSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "Numero et mot de passe requis" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Mot de passe: 6 caracteres minimum" }, { status: 400 });
    }

    const existing = await findUserByPhone(phone);
    if (existing) {
      return NextResponse.json({ error: "Ce numero est deja inscrit" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(phone, passwordHash);
    const token = await createSession({ uid: user.uid, phone: user.phone });

    const res = NextResponse.json({ uid: user.uid, phone: user.phone });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
