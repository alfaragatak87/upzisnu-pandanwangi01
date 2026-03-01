import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminValidationError, readString } from "@/lib/admin-form";
import { redirectWithFeedback } from "@/lib/admin-feedback";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  try {
    const form = await req.formData();
    const name = readString(form, "name", {
      label: "Nama dusun",
      field: "name",
      required: true,
      maxLength: 80,
    });

    const totalDusun = await prisma.gkoinDusun.count();
    if (totalDusun >= 6) {
      return redirectWithFeedback(req, "/admin/gkoin/dusun", {
        err: "Maksimal 6 dusun. Slot penuh.",
        query: { field: "name" },
      });
    }

    const existing = await prisma.gkoinDusun.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) {
      return redirectWithFeedback(req, "/admin/gkoin/dusun", {
        err: "Nama dusun sudah ada.",
        query: { field: "name" },
      });
    }

    await prisma.gkoinDusun.create({ data: { name } });
    return redirectWithFeedback(req, "/admin/gkoin/dusun", { ok: "Dusun berhasil ditambahkan." });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return redirectWithFeedback(req, "/admin/gkoin/dusun", {
        err: error.message,
        query: { field: error.field },
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return redirectWithFeedback(req, "/admin/gkoin/dusun", {
        err: "Nama dusun sudah ada.",
        query: { field: "name" },
      });
    }
    return redirectWithFeedback(req, "/admin/gkoin/dusun", { err: "Gagal menambah dusun." });
  }
}
