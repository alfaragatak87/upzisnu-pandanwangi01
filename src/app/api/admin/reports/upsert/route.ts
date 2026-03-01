import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminValidationError, readInt, readNullableString } from "@/lib/admin-form";
import { redirectWithFeedback } from "@/lib/admin-feedback";
import { saveUploadedFile, UploadValidationError } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  try {
    const form = await req.formData();
    const month = readInt(form, "month", { label: "Bulan", field: "month", required: true, min: 1, max: 12 });
    const year = readInt(form, "year", { label: "Tahun", field: "year", required: true, min: 2000, max: 2100 });
    const notes = readNullableString(form, "notes", { label: "Catatan", field: "notes", maxLength: 500 });

    const income = form.get("incomePdf");
    const expense = form.get("expensePdf");

    let incomePdfPath: string | undefined;
    let expensePdfPath: string | undefined;

    if (income instanceof File && income.size > 0) {
      incomePdfPath = await saveUploadedFile(income, "uploads/reports", {
        maxBytes: 8 * 1024 * 1024,
        allowedMimeTypes: ["application/pdf", "application/x-pdf"],
        allowedExtensions: [".pdf"],
      });
    }
    if (expense instanceof File && expense.size > 0) {
      expensePdfPath = await saveUploadedFile(expense, "uploads/reports", {
        maxBytes: 8 * 1024 * 1024,
        allowedMimeTypes: ["application/pdf", "application/x-pdf"],
        allowedExtensions: [".pdf"],
      });
    }

    const existing = await prisma.monthlyReport.findFirst({ where: { month, year } });
    if (!existing && !incomePdfPath && !expensePdfPath) {
      return redirectWithFeedback(req, "/admin/laporan", {
        err: "Upload minimal satu file PDF untuk membuat laporan baru.",
        query: { field: "incomePdf" },
      });
    }

    if (existing) {
      await prisma.monthlyReport.update({
        where: { id: existing.id },
        data: { notes, ...(incomePdfPath ? { incomePdfPath } : {}), ...(expensePdfPath ? { expensePdfPath } : {}) },
      });
    } else {
      await prisma.monthlyReport.create({
        data: {
          month,
          year,
          notes,
          incomePdfPath: incomePdfPath ?? null,
          expensePdfPath: expensePdfPath ?? null,
        },
      });
    }

    return redirectWithFeedback(req, "/admin/laporan", { ok: "Laporan bulanan berhasil disimpan." });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return redirectWithFeedback(req, "/admin/laporan", {
        err: error.message,
        query: { field: error.field },
      });
    }
    if (error instanceof UploadValidationError) {
      return redirectWithFeedback(req, "/admin/laporan", {
        err: error.message,
        query: { field: "incomePdf" },
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return redirectWithFeedback(req, "/admin/laporan", {
        err: "Laporan untuk periode ini sudah ada.",
        query: { field: "month" },
      });
    }
    return redirectWithFeedback(req, "/admin/laporan", { err: "Gagal menyimpan laporan bulanan." });
  }
}
