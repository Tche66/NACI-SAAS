import fs from "fs";
import path from "path";

const ACCESS_FILE = path.join(process.cwd(), "data", "access.json");

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

function ensureFile() {
  const dir = path.dirname(ACCESS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ACCESS_FILE)) fs.writeFileSync(ACCESS_FILE, "{}", "utf-8");
}

function readAll(): Record<string, UserAccess> {
  ensureFile();
  return JSON.parse(fs.readFileSync(ACCESS_FILE, "utf-8"));
}

function writeAll(data: Record<string, UserAccess>) {
  ensureFile();
  fs.writeFileSync(ACCESS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function getUserAccess(uid: string): UserAccess {
  const all = readAll();
  if (!all[uid]) {
    const access: UserAccess = {
      uid,
      plan: "free",
      predictionsToday: 0,
      lastPredictionDate: todayStr(),
      dayPassExpires: null,
      monthlyExpires: null,
    };
    all[uid] = access;
    writeAll(all);
    return access;
  }
  return all[uid];
}

export function canAccessPrediction(uid: string): {
  allowed: boolean;
  reason: string;
  remaining: number;
  plan: string;
} {
  const all = readAll();
  const access = getUserAccess(uid);
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
    all[uid] = access;
    writeAll(all);
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

export function consumePrediction(uid: string): void {
  const all = readAll();
  const access = getUserAccess(uid);
  const now = new Date().toISOString();

  if (access.plan === "monthly" && access.monthlyExpires && access.monthlyExpires > now) return;
  if (access.plan === "day_pass" && access.dayPassExpires && access.dayPassExpires > now) return;

  access.predictionsToday += 1;
  access.lastPredictionDate = todayStr();
  all[uid] = access;
  writeAll(all);
}

export function activateDayPass(uid: string): void {
  const all = readAll();
  const access = getUserAccess(uid);
  access.plan = "day_pass";
  access.dayPassExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  all[uid] = access;
  writeAll(all);
}

export function activateMonthly(uid: string, months: number = 1): void {
  const all = readAll();
  const access = getUserAccess(uid);
  access.plan = "monthly";
  access.monthlyExpires = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
  all[uid] = access;
  writeAll(all);
}
