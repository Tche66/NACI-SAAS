import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByPhone } from "@/lib/users";
import { createSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "Numero et mot de passe requis" }, { status: 400 });
    }

    const user = await findUserByPhone(phone);
    if (!user) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }

    const token = await createSession({ uid: user.uid, phone: user.phone });
    const res = NextResponse.json({ uid: user.uid, phone: user.phone });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur connexion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
