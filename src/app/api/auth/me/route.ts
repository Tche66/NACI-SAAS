import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccessPrediction } from "@/lib/access";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const accessInfo = canAccessPrediction(session.uid);

  return NextResponse.json({
    user: { uid: session.uid, email: session.email },
    access: accessInfo,
  });
}
