import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccessPrediction, consumePrediction } from "@/lib/access";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  }

  const info = await canAccessPrediction(session.uid);
  if (!info.allowed) {
    return NextResponse.json({ error: info.reason, access: info }, { status: 403 });
  }

  await consumePrediction(session.uid);
  const updated = await canAccessPrediction(session.uid);

  return NextResponse.json({ ok: true, access: updated });
}
