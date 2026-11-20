import crypto from "crypto";

const SAASPAY_API_KEY = process.env.SAASPAY_API_KEY || "";
const SAASPAY_SECRET = process.env.SAASPAY_SECRET || "";
const SAASPAY_BASE_URL = process.env.SAASPAY_BASE_URL || "https://api.saaspay.co";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata: Record<string, string>;
  returnUrl: string;
  callbackUrl: string;
}

export interface PaymentResponse {
  id: string;
  status: string;
  paymentUrl: string;
  amount: number;
}

export async function createPayment(params: {
  uid: string;
  plan: "day_pass" | "monthly";
  phone?: string;
}): Promise<PaymentResponse> {
  const amount = params.plan === "day_pass" ? 100 : 2000;
  const description = params.plan === "day_pass"
    ? "LONACI Pro - Pass 24h"
    : "LONACI Pro - Abonnement mensuel";

  const body: PaymentRequest = {
    amount,
    currency: "XOF",
    description,
    customerPhone: params.phone,
    metadata: {
      uid: params.uid,
      plan: params.plan,
    },
    returnUrl: `${APP_URL}/dashboard?payment=success`,
    callbackUrl: `${APP_URL}/api/payment/callback`,
  };

  const res = await fetch(`${SAASPAY_BASE_URL}/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SAASPAY_API_KEY}`,
      "X-Secret": SAASPAY_SECRET,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SaaSPay error: ${res.status} ${err}`);
  }

  return res.json();
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expected = crypto.createHmac("sha256", SAASPAY_SECRET).update(payload).digest("hex");
  return expected === signature;
}
