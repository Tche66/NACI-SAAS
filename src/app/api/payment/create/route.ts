import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findUserByUid } from "@/lib/users";
import { createPayment } from "@/lib/saaspay";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non connecte" }, { status: 401 });
    }

    const { plan } = await req.json();
    if (plan !== "day_pass" && plan !== "monthly") {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const user = await findUserByUid(session.uid);
    const payment = await createPayment({
      uid: session.uid,
      plan,
      phone: user?.phone,
      email: session.email,
    });
    return NextResponse.json(payment);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur paiement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
