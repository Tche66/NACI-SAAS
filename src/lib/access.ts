import { redis } from "./redis";

export interface UserAccess {
  uid: string;
  plan: "free" | "day_pass" | "monthly";
  predictionsToday: number;
  lastPredictionDate: string;
  dayPassExpires: string | null;
  monthlyExpires: string | null;
}

const FREE_PREDICTIONS_PER_DAY = 4;
const accessKey = (uid: string) => `access:${uid}`;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getUserAccess(uid: string): Promise<UserAccess> {
  const existing = await redis.get<UserAccess>(accessKey(uid));
  if (existing) return existing;

  const access: UserAccess = {
    uid,
    plan: "free",
    predictionsToday: 0,
    lastPredictionDate: todayStr(),
    dayPassExpires: null,
    monthlyExpires: null,
  };
  await redis.set(accessKey(uid), access);
  return access;
}

async function saveAccess(access: UserAccess): Promise<void> {
  await redis.set(accessKey(access.uid), access);
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

  if (access.plan === "monthly" && access.monthlyExpires && access.monthlyExpires > now) {
    return { allowed: true, reason: "Abonnement mensuel actif", remaining: -1, plan: "monthly" };
  }

  if (access.plan === "day_pass" && access.dayPassExpires && access.dayPassExpires > now) {
    return { allowed: true, reason: "Pass 24h actif", remaining: -1, plan: "day_pass" };
  }

  if (access.lastPredictionDate !== today) {
    access.predictionsToday = 0;
    access.lastPredictionDate = today;
    access.plan = "free";
    await saveAccess(access);
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
  const access = await getUserAccess(uid);
  const now = new Date().toISOString();

  if (access.plan === "monthly" && access.monthlyExpires && access.monthlyExpires > now) return;
  if (access.plan === "day_pass" && access.dayPassExpires && access.dayPassExpires > now) return;

  access.predictionsToday += 1;
  access.lastPredictionDate = todayStr();
  await saveAccess(access);
}

export async function activateDayPass(uid: string): Promise<void> {
  const access = await getUserAccess(uid);
  access.plan = "day_pass";
  access.dayPassExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await saveAccess(access);
}

export async function activateMonthly(uid: string, months: number = 1): Promise<void> {
  const access = await getUserAccess(uid);
  access.plan = "monthly";
  access.monthlyExpires = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
  await saveAccess(access);
}
