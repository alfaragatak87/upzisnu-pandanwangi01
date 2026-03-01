import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { redirectWithFeedback } from "@/lib/admin-feedback";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });
  try {
    await prisma.gkoinDusun.delete({ where: { id: params.id } });
    return redirectWithFeedback(req, "/admin/gkoin/dusun", { ok: "Dusun berhasil dihapus." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return redirectWithFeedback(req, "/admin/gkoin/dusun", { err: "Dusun tidak ditemukan." });
      }
      if (error.code === "P2003") {
        return redirectWithFeedback(req, "/admin/gkoin/dusun", {
          err: "Dusun masih dipakai data setoran dan tidak bisa dihapus.",
        });
      }
    }
    return redirectWithFeedback(req, "/admin/gkoin/dusun", { err: "Gagal menghapus dusun." });
  }
}
