import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminValidationError, readBoolean, readInt, readString } from "@/lib/admin-form";
import { redirectWithFeedback } from "@/lib/admin-feedback";
import { slugify } from "@/lib/slug";
import { saveUploadedFile, UploadValidationError } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  try {
    const form = await req.formData();
    const title = readString(form, "title", { label: "Judul", field: "title", required: true, maxLength: 180 });
    const category = readString(form, "category", { label: "Kategori", field: "category", required: true, maxLength: 100 });
    const description = readString(form, "description", {
      label: "Deskripsi",
      field: "description",
      required: true,
      maxLength: 5000,
    });
    const sortOrder = readInt(form, "sortOrder", { label: "Urutan", field: "sortOrder", min: 0, max: 9999 });
    const isActive = readBoolean(form, "isActive");
    const slug = slugify(title);
    if (!slug) {
      return redirectWithFeedback(req, `/admin/program/${params.id}/edit`, {
        err: "Judul program tidak valid untuk dijadikan slug.",
        query: { field: "title" },
      });
    }

    const duplicate = await prisma.program.findFirst({
      where: {
        id: { not: params.id },
        OR: [{ title }, { slug }],
      },
      select: { id: true },
    });
    if (duplicate) {
      return redirectWithFeedback(req, `/admin/program/${params.id}/edit`, {
        err: "Judul atau slug program sudah dipakai.",
        query: { field: "title" },
      });
    }

    const image = form.get("image");
    let imagePath: string | undefined;
    if (image instanceof File && image.size > 0) {
      imagePath = await saveUploadedFile(image, "uploads/programs", {
        maxBytes: 2 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
      });
    }

    await prisma.program.update({
      where: { id: params.id },
      data: { title, slug, category, description, sortOrder, isActive, ...(imagePath ? { imagePath } : {}) },
    });
    return redirectWithFeedback(req, "/admin/program", { ok: "Program berhasil diperbarui." });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return redirectWithFeedback(req, `/admin/program/${params.id}/edit`, {
        err: error.message,
        query: { field: error.field },
      });
    }
    if (error instanceof UploadValidationError) {
      return redirectWithFeedback(req, `/admin/program/${params.id}/edit`, {
        err: error.message,
        query: { field: "image" },
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return redirectWithFeedback(req, `/admin/program/${params.id}/edit`, {
          err: "Judul atau slug program sudah dipakai.",
          query: { field: "title" },
        });
      }
      if (error.code === "P2025") {
        return redirectWithFeedback(req, "/admin/program", { err: "Program tidak ditemukan." });
      }
    }
    return redirectWithFeedback(req, `/admin/program/${params.id}/edit`, { err: "Gagal memperbarui program." });
  }
}
