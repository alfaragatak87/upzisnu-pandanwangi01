import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
}
