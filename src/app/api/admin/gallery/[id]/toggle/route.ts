import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { redirectWithFeedback } from "@/lib/admin-feedback";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });
  const p = await prisma.galleryPhoto.findUnique({ where: { id: params.id } });
  if (!p) {
    return redirectWithFeedback(req, "/admin/galeri", { err: "Foto galeri tidak ditemukan." });
  }

  await prisma.galleryPhoto.update({ where: { id: p.id }, data: { isVisible: !p.isVisible } });
  return redirectWithFeedback(req, "/admin/galeri", { ok: "Status tampilan foto berhasil diubah." });
}
