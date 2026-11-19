import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

export interface UserAccess {
  uid: string;
  plan: "free" | "day_pass" | "monthly";
  predictionsToday: number;
  lastPredictionDate: string;
  dayPassExpires: string | null;
  monthlyExpires: string | null;
}

const FREE_PREDICTIONS_PER_DAY = 2;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getUserAccess(uid: string): Promise<UserAccess> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const access: UserAccess = {
      uid,
      plan: "free",
      predictionsToday: 0,
      lastPredictionDate: todayStr(),
      dayPassExpires: null,
      monthlyExpires: null,
    };
    await setDoc(ref, access);
    return access;
  }
  return snap.data() as UserAccess;
}

export async function canAccessPrediction(uid: string): Promise<{
  allowed: boolean;
  reason: string;
  remaining: number;
  plan: string;
}> {
  const access = await getUserAccess(uid);
  const today = todayStr();
  const now = new Date().toISOString();

  // Monthly subscriber
  if (access.plan === "monthly" && access.monthlyExpires && access.monthlyExpires > now) {
    return { allowed: true, reason: "Abonnement mensuel actif", remaining: -1, plan: "monthly" };
  }

  // Day pass (100F/24h)
  if (access.plan === "day_pass" && access.dayPassExpires && access.dayPassExpires > now) {
    return { allowed: true, reason: "Pass 24h actif", remaining: -1, plan: "day_pass" };
  }

  // Free tier: reset counter if new day
  if (access.lastPredictionDate !== today) {
    await updateDoc(doc(db, "users", uid), {
      predictionsToday: 0,
      lastPredictionDate: today,
      plan: "free",
    });
    access.predictionsToday = 0;
  }

  const remaining = FREE_PREDICTIONS_PER_DAY - access.predictionsToday;
  if (remaining > 0) {
    return { allowed: true, reason: `${remaining} predictions gratuites restantes`, remaining, plan: "free" };
  }

  return {
    allowed: false,
    reason: "Limite atteinte. Achete un pass 24h (100F) ou abonne-toi.",
    remaining: 0,
    plan: "free",
  };
}

export async function consumePrediction(uid: string): Promise<void> {
  const ref = doc(db, "users", uid);
  const access = await getUserAccess(uid);
  const now = new Date().toISOString();

  // Paid users don't consume
  if (access.plan === "monthly" && access.monthlyExpires && access.monthlyExpires > now) return;
  if (access.plan === "day_pass" && access.dayPassExpires && access.dayPassExpires > now) return;

  await updateDoc(ref, {
    predictionsToday: increment(1),
    lastPredictionDate: todayStr(),
  });
}

export async function activateDayPass(uid: string): Promise<void> {
  const ref = doc(db, "users", uid);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await updateDoc(ref, { plan: "day_pass", dayPassExpires: expires });
}

export async function activateMonthly(uid: string, months: number = 1): Promise<void> {
  const ref = doc(db, "users", uid);
  const expires = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
  await updateDoc(ref, { plan: "monthly", monthlyExpires: expires });
}
