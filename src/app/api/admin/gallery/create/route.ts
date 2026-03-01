import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminValidationError, readBoolean, readInt, readOptionalDate, readString } from "@/lib/admin-form";
import { redirectWithFeedback } from "@/lib/admin-feedback";
import { saveUploadedFile, UploadValidationError } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  try {
    const form = await req.formData();
    const albumId = readString(form, "albumId", { label: "Album", field: "albumId", required: true, maxLength: 100 });
    const caption = readString(form, "caption", { label: "Caption", field: "caption", required: true, maxLength: 200 });
    const sortOrder = readInt(form, "sortOrder", { label: "Urutan", field: "sortOrder", min: 0, max: 9999 });
    const isVisible = readBoolean(form, "isVisible");
    const takenAt = readOptionalDate(form, "takenAt", "takenAt") ?? new Date();

    const album = await prisma.galleryAlbum.findUnique({ where: { id: albumId }, select: { id: true } });
    if (!album) {
      return redirectWithFeedback(req, "/admin/galeri", {
        err: "Album galeri tidak ditemukan.",
        query: { field: "albumId" },
      });
    }

    const files: File[] = [];
    const imagesFromMulti = form.getAll("images");
    if (imagesFromMulti.length > 0) {
      for (const f of imagesFromMulti) {
        if (f instanceof File && f.size > 0) files.push(f);
      }
    }
    if (files.length === 0) {
      const single = form.get("image");
      if (single instanceof File && single.size > 0) files.push(single);
    }
    if (files.length === 0) {
      return redirectWithFeedback(req, "/admin/galeri", {
        err: "Pilih minimal satu gambar untuk di-upload.",
        query: { field: "images" },
      });
    }

    for (const file of files) {
      const imgPath = await saveUploadedFile(file, "uploads/gallery", {
        maxBytes: 3 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
      });
      await prisma.galleryPhoto.create({
        data: {
          albumId,
          caption,
          sortOrder,
          isVisible,
          takenAt,
          imagePath: imgPath,
        },
      });
    }
    return redirectWithFeedback(req, "/admin/galeri", {
      ok: `${files.length} foto berhasil di-upload.`,
    });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return redirectWithFeedback(req, "/admin/galeri", {
        err: error.message,
        query: { field: error.field },
      });
    }
    if (error instanceof UploadValidationError) {
      return redirectWithFeedback(req, "/admin/galeri", {
        err: error.message,
        query: { field: "images" },
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return redirectWithFeedback(req, "/admin/galeri", {
        err: "Album galeri tidak valid.",
        query: { field: "albumId" },
      });
    }
    return redirectWithFeedback(req, "/admin/galeri", { err: "Gagal upload foto galeri." });
  }
}
