import fs from "fs";
import path from "path";
import crypto from "crypto";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

export interface User {
  uid: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
}

function ensureDataDir() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]", "utf-8");
  }
}

function readUsers(): User[] {
  ensureDataDir();
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeUsers(users: User[]) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function findUserByEmail(email: string): User | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserByUid(uid: string): User | undefined {
  return readUsers().find((u) => u.uid === uid);
}

export function createUser(email: string, phone: string, passwordHash: string): User {
  const users = readUsers();
  const user: User = {
    uid: crypto.randomUUID(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  return user;
}
