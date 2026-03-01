import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminValidationError, readBoolean, readInt, readString } from "@/lib/admin-form";
import { redirectWithFeedback } from "@/lib/admin-feedback";
import { slugify } from "@/lib/slug";
import { saveUploadedFile, UploadValidationError } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
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
      return redirectWithFeedback(req, "/admin/program/new", {
        err: "Judul program tidak valid untuk dijadikan slug.",
        query: { field: "title" },
      });
    }

    const duplicate = await prisma.program.findFirst({
      where: { OR: [{ title }, { slug }] },
      select: { id: true },
    });
    if (duplicate) {
      return redirectWithFeedback(req, "/admin/program/new", {
        err: "Judul atau slug program sudah dipakai.",
        query: { field: "title" },
      });
    }

    const image = form.get("image");
    let imagePath: string | null = null;
    if (image instanceof File && image.size > 0) {
      imagePath = await saveUploadedFile(image, "uploads/programs", {
        maxBytes: 2 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
      });
    }

    await prisma.program.create({
      data: { title, slug, category, description, sortOrder, isActive, imagePath },
    });
    return redirectWithFeedback(req, "/admin/program", { ok: "Program berhasil ditambahkan." });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return redirectWithFeedback(req, "/admin/program/new", {
        err: error.message,
        query: { field: error.field },
      });
    }
    if (error instanceof UploadValidationError) {
      return redirectWithFeedback(req, "/admin/program/new", {
        err: error.message,
        query: { field: "image" },
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return redirectWithFeedback(req, "/admin/program/new", {
        err: "Judul atau slug program sudah dipakai.",
        query: { field: "title" },
      });
    }
    return redirectWithFeedback(req, "/admin/program/new", { err: "Gagal menyimpan program." });
  }
}
