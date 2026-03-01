import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { redirectWithFeedback } from "@/lib/admin-feedback";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  try {
    await prisma.news.delete({ where: { id: params.id } });
    return redirectWithFeedback(req, "/admin/berita", { ok: "Berita berhasil dihapus." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return redirectWithFeedback(req, "/admin/berita", { err: "Berita tidak ditemukan." });
    }
    return redirectWithFeedback(req, "/admin/berita", { err: "Gagal menghapus berita." });
  }
}
