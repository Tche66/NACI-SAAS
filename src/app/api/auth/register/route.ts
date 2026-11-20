import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "@/lib/users";
import { createSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, phone, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Mot de passe: 6 caracteres minimum" }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Ce compte existe deja" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(email, phone || "", passwordHash);
    const token = await createSession({ uid: user.uid, email: user.email });

    const res = NextResponse.json({ uid: user.uid, email: user.email });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
