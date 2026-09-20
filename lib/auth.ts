import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import crypto from "node:crypto";
import { db } from "./db";

const COOKIE = "tg_session";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET || "development-only-secret-change-me");

export async function createSession(userId: string, remember = true) {
  const days = remember ? 30 : 1;
  const expiresAt = new Date(Date.now() + days * 86400000);
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secret());
  await db.session.create({ data: { userId, tokenHash: crypto.createHash("sha256").update(token).digest("hex"), expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = String(payload.uid || "");
    if (!userId) return null;
    const session = await db.session.findFirst({ where: { userId, tokenHash: crypto.createHash("sha256").update(token).digest("hex"), expiresAt: { gt: new Date() } }, include: { user: true } });
    return session?.user ?? null;
  } catch { return null; }
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: crypto.createHash("sha256").update(token).digest("hex") } });
  jar.delete(COOKIE);
}
