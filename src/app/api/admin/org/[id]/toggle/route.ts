import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { redirectWithFeedback } from "@/lib/admin-feedback";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  const m = await prisma.organizationMember.findUnique({ where: { id: params.id } });
  if (!m) {
    return redirectWithFeedback(req, "/admin/pengurus", { err: "Data pengurus tidak ditemukan." });
  }

  await prisma.organizationMember.update({ where: { id: m.id }, data: { isActive: !m.isActive } });
  return redirectWithFeedback(req, "/admin/pengurus", { ok: "Status pengurus berhasil diubah." });
}
