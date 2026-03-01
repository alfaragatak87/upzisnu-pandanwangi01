import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminValidationError, readBoolean, readString } from "@/lib/admin-form";
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
    const contentMarkdown = readString(form, "contentMarkdown", {
      label: "Isi berita",
      field: "contentMarkdown",
      required: true,
      maxLength: 50000,
    });
    const isPublished = readBoolean(form, "isPublished");
    const slug = slugify(title);
    if (!slug) {
      return redirectWithFeedback(req, `/admin/berita/${params.id}/edit`, {
        err: "Judul berita tidak valid untuk dijadikan slug.",
        query: { field: "title" },
      });
    }

    const duplicate = await prisma.news.findFirst({
      where: {
        id: { not: params.id },
        OR: [{ title }, { slug }],
      },
      select: { id: true },
    });
    if (duplicate) {
      return redirectWithFeedback(req, `/admin/berita/${params.id}/edit`, {
        err: "Judul atau slug berita sudah dipakai.",
        query: { field: "title" },
      });
    }

    const cover = form.get("cover");
    let coverImagePath: string | undefined;
    if (cover instanceof File && cover.size > 0) {
      coverImagePath = await saveUploadedFile(cover, "uploads/news", {
        maxBytes: 2 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
      });
    }

    await prisma.news.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        contentMarkdown,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        ...(coverImagePath ? { coverImagePath } : {}),
      },
    });
    return redirectWithFeedback(req, "/admin/berita", { ok: "Berita berhasil diperbarui." });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return redirectWithFeedback(req, `/admin/berita/${params.id}/edit`, {
        err: error.message,
        query: { field: error.field },
      });
    }
    if (error instanceof UploadValidationError) {
      return redirectWithFeedback(req, `/admin/berita/${params.id}/edit`, {
        err: error.message,
        query: { field: "cover" },
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return redirectWithFeedback(req, `/admin/berita/${params.id}/edit`, {
          err: "Judul atau slug berita sudah dipakai.",
          query: { field: "title" },
        });
      }
      if (error.code === "P2025") {
        return redirectWithFeedback(req, "/admin/berita", { err: "Berita tidak ditemukan." });
      }
    }
    return redirectWithFeedback(req, `/admin/berita/${params.id}/edit`, { err: "Gagal memperbarui berita." });
  }
}
