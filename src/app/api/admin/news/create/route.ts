import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminValidationError, readBoolean, readString } from "@/lib/admin-form";
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
    const contentMarkdown = readString(form, "contentMarkdown", {
      label: "Isi berita",
      field: "contentMarkdown",
      required: true,
      maxLength: 50000,
    });
    const isPublished = readBoolean(form, "isPublished");
    const slug = slugify(title);
    if (!slug) {
      return redirectWithFeedback(req, "/admin/berita/new", {
        err: "Judul berita tidak valid untuk dijadikan slug.",
        query: { field: "title" },
      });
    }

    const duplicate = await prisma.news.findFirst({
      where: { OR: [{ title }, { slug }] },
      select: { id: true },
    });
    if (duplicate) {
      return redirectWithFeedback(req, "/admin/berita/new", {
        err: "Judul atau slug berita sudah dipakai.",
        query: { field: "title" },
      });
    }

    const cover = form.get("cover");
    let coverImagePath: string | null = null;
    if (cover instanceof File && cover.size > 0) {
      coverImagePath = await saveUploadedFile(cover, "uploads/news", {
        maxBytes: 2 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
      });
    }

    await prisma.news.create({
      data: {
        title,
        slug,
        coverImagePath,
        contentMarkdown,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });
    return redirectWithFeedback(req, "/admin/berita", { ok: "Berita berhasil ditambahkan." });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return redirectWithFeedback(req, "/admin/berita/new", {
        err: error.message,
        query: { field: error.field },
      });
    }
    if (error instanceof UploadValidationError) {
      return redirectWithFeedback(req, "/admin/berita/new", {
        err: error.message,
        query: { field: "cover" },
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return redirectWithFeedback(req, "/admin/berita/new", {
        err: "Judul atau slug berita sudah dipakai.",
        query: { field: "title" },
      });
    }
    return redirectWithFeedback(req, "/admin/berita/new", { err: "Gagal menyimpan berita." });
  }
}
