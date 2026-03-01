import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminValidationError, readInt, readNullableString, readOptionalDate, readString } from "@/lib/admin-form";
import { redirectWithFeedback } from "@/lib/admin-feedback";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  const backQuery: { month?: string; year?: string; q?: string } = {};

  try {
    const form = await req.formData();
    backQuery.month = String(form.get("month") ?? "").trim();
    backQuery.year = String(form.get("year") ?? "").trim();
    backQuery.q = String(form.get("q") ?? "").trim() || undefined;

    const dusunId = readString(form, "dusunId", {
      label: "Dusun",
      field: "dusunId",
      required: true,
      maxLength: 100,
    });
    const month = readInt(form, "month", { label: "Bulan", field: "month", required: true, min: 1, max: 12 });
    const year = readInt(form, "year", { label: "Tahun", field: "year", required: true, min: 2020, max: 2100 });
    const amount = readInt(form, "amount", { label: "Jumlah setoran", field: "amount", required: true, min: 0, max: 1_000_000_000 });
    const note = readNullableString(form, "note", { label: "Keterangan", field: "note", maxLength: 500 });
    const depositorName = readNullableString(form, "depositorName", {
      label: "Nama penyetor",
      field: "depositorName",
      maxLength: 120,
    });
    const inputDate = readOptionalDate(form, "inputDate", "inputDate") ?? new Date();

    const dusun = await prisma.gkoinDusun.findUnique({ where: { id: dusunId }, select: { id: true } });
    if (!dusun) {
      return redirectWithFeedback(req, "/admin/gkoin/setoran", {
        err: "Dusun tidak ditemukan.",
        query: { ...backQuery, field: "dusunId" },
      });
    }

    await prisma.gkoinDeposit.upsert({
      where: { dusunId_month_year: { dusunId, month, year } },
      update: { amount, note, depositorName, inputDate },
      create: { dusunId, month, year, amount, note, depositorName, inputDate },
    });

    return redirectWithFeedback(req, "/admin/gkoin/setoran", {
      ok: "Setoran berhasil disimpan.",
      query: backQuery,
    });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return redirectWithFeedback(req, "/admin/gkoin/setoran", {
        err: error.message,
        query: { ...backQuery, field: error.field },
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return redirectWithFeedback(req, "/admin/gkoin/setoran", {
        err: "Dusun tidak valid.",
        query: { ...backQuery, field: "dusunId" },
      });
    }
    return redirectWithFeedback(req, "/admin/gkoin/setoran", {
      err: "Gagal menyimpan setoran.",
      query: backQuery,
    });
  }
}
