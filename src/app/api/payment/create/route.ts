import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "@/lib/saaspay";

export async function POST(req: NextRequest) {
  try {
    const { uid, plan, phone, email } = await req.json();
    if (!uid || !plan) {
      return NextResponse.json({ error: "Parametres manquants" }, { status: 400 });
    }
    if (plan !== "day_pass" && plan !== "monthly") {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }
    const payment = await createPayment({ uid, plan, phone, email });
    return NextResponse.json(payment);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur paiement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
