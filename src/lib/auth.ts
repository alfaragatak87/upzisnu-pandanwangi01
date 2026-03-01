import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "upzisnu_admin_session";

function getSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET belum di-set di .env");
  return new TextEncoder().encode(s);
}

export type SessionPayload = { sub: string; username: string };

export async function createSessionCookie(payload: SessionPayload) {
  const token = await new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string" || typeof payload.username !== "string") return null;
    return { sub: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  return await getSession();
}
