import { kv } from "@vercel/kv";
import crypto from "crypto";

export interface User {
  uid: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
}

const userKey = (uid: string) => `user:${uid}`;
const emailIndex = (email: string) => `email:${email.toLowerCase().trim()}`;

export async function findUserByEmail(email: string): Promise<User | null> {
  const uid = await kv.get<string>(emailIndex(email));
  if (!uid) return null;
  return kv.get<User>(userKey(uid));
}

export async function findUserByUid(uid: string): Promise<User | null> {
  return kv.get<User>(userKey(uid));
}

export async function createUser(email: string, phone: string, passwordHash: string): Promise<User> {
  const user: User = {
    uid: crypto.randomUUID(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  await kv.set(userKey(user.uid), user);
  await kv.set(emailIndex(user.email), user.uid);
  return user;
}
