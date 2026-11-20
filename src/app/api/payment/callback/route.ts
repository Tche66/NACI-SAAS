import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/saaspay";
import { activateDayPass, activateMonthly } from "@/lib/access";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-saaspay-signature") || "";

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    const data = JSON.parse(body);
    if (data.status !== "completed" && data.status !== "success") {
      return NextResponse.json({ ok: true, message: "Paiement non complete" });
    }

    const uid = data.metadata?.uid;
    const plan = data.metadata?.plan;
    if (!uid || !plan) {
      return NextResponse.json({ error: "Metadata manquante" }, { status: 400 });
    }

    if (plan === "day_pass") {
      activateDayPass(uid);
    } else if (plan === "monthly") {
      activateMonthly(uid);
    }

    return NextResponse.json({ ok: true, message: `Plan ${plan} active pour ${uid}` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur webhook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
