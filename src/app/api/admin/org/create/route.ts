import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validateOrgParentForCreate } from "@/lib/admin-org";
import { AdminValidationError, readBoolean, readInt, readNullableString, readString } from "@/lib/admin-form";
import { redirectWithFeedback } from "@/lib/admin-feedback";
import { saveUploadedFile, UploadValidationError } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  try {
    const form = await req.formData();
    const positionTitle = readString(form, "positionTitle", {
      label: "Jabatan",
      field: "positionTitle",
      required: true,
      maxLength: 120,
    });
    const name = readString(form, "name", { label: "Nama", field: "name", required: true, maxLength: 120 });
    const parentIdRaw = readString(form, "parentId", { field: "parentId", maxLength: 100 });
    const parentId = await validateOrgParentForCreate(parentIdRaw || null);
    const whatsapp = readNullableString(form, "whatsapp", { label: "No WA", field: "whatsapp", maxLength: 40 });
    const sortOrder = readInt(form, "sortOrder", { label: "Urutan", field: "sortOrder", min: 0, max: 9999 });
    const isActive = readBoolean(form, "isActive");

    const photo = form.get("photo");
    let photoPath: string | null = null;
    if (photo instanceof File && photo.size > 0) {
      photoPath = await saveUploadedFile(photo, "uploads/org", {
        maxBytes: 2 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
      });
    }

    await prisma.organizationMember.create({ data: { positionTitle, name, parentId, whatsapp, sortOrder, isActive, photoPath } });
    return redirectWithFeedback(req, "/admin/pengurus", { ok: "Data pengurus berhasil ditambahkan." });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return redirectWithFeedback(req, "/admin/pengurus", {
        err: error.message,
        query: { field: error.field },
      });
    }
    if (error instanceof UploadValidationError) {
      return redirectWithFeedback(req, "/admin/pengurus", {
        err: error.message,
        query: { field: "photo" },
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return redirectWithFeedback(req, "/admin/pengurus", {
        err: "Parent/atasan tidak valid.",
        query: { field: "parentId" },
      });
    }
    return redirectWithFeedback(req, "/admin/pengurus", { err: "Gagal menambahkan data pengurus." });
  }
}
