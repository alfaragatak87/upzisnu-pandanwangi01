import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { redirectWithFeedback } from "@/lib/admin-feedback";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  const form = await req.formData();
  const query = {
    month: String(form.get("month") ?? "").trim() || undefined,
    year: String(form.get("year") ?? "").trim() || undefined,
    q: String(form.get("q") ?? "").trim() || undefined,
  };

  try {
    await prisma.gkoinDeposit.delete({ where: { id: params.id } });
    return redirectWithFeedback(req, "/admin/gkoin/setoran", {
      ok: "Setoran berhasil dihapus.",
      query,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return redirectWithFeedback(req, "/admin/gkoin/setoran", {
        err: "Data setoran tidak ditemukan.",
        query,
      });
    }
    return redirectWithFeedback(req, "/admin/gkoin/setoran", {
      err: "Gagal menghapus setoran.",
      query,
    });
  }
}
