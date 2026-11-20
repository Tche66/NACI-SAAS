import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/users";
import { createSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }

    const token = await createSession({ uid: user.uid, email: user.email });
    const res = NextResponse.json({ uid: user.uid, email: user.email });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur connexion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
