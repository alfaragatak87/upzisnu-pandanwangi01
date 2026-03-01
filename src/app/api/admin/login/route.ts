import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!username || !password) {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url), { status: 303 });
  }

  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return NextResponse.redirect(new URL("/admin/login?error=1", req.url), { status: 303 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.redirect(new URL("/admin/login?error=1", req.url), { status: 303 });

  await createSessionCookie({ sub: user.id, username: user.username });
  return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
}
