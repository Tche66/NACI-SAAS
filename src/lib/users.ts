import { kv } from "@vercel/kv";
import crypto from "crypto";

export interface User {
  uid: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
}

const userKey = (uid: string) => `user:${uid}`;
const phoneIndex = (phone: string) => `phone:${normalizePhone(phone)}`;

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("225")) return digits;
  return `225${digits}`;
}

export async function findUserByPhone(phone: string): Promise<User | null> {
  const uid = await kv.get<string>(phoneIndex(phone));
  if (!uid) return null;
  return kv.get<User>(userKey(uid));
}

export async function findUserByUid(uid: string): Promise<User | null> {
  return kv.get<User>(userKey(uid));
}

export async function createUser(phone: string, passwordHash: string): Promise<User> {
  const user: User = {
    uid: crypto.randomUUID(),
    phone: normalizePhone(phone),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  await kv.set(userKey(user.uid), user);
  await kv.set(phoneIndex(user.phone), user.uid);
  return user;
}
