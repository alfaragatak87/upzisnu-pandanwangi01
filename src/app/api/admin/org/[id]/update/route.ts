import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validateOrgParentForUpdate } from "@/lib/admin-org";
import { AdminValidationError, readBoolean, readInt, readNullableString, readString } from "@/lib/admin-form";
import { redirectWithFeedback } from "@/lib/admin-feedback";
import { saveUploadedFile, UploadValidationError } from "@/lib/upload";

export const runtime = "nodejs";

// Handle update of organization member (pengurus). Allows updating fields and optional new photo upload.
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  const id = params.id;

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
    const parentId = await validateOrgParentForUpdate(id, parentIdRaw || null);
    const whatsapp = readNullableString(form, "whatsapp", { label: "No WA", field: "whatsapp", maxLength: 40 });
    const sortOrder = readInt(form, "sortOrder", { label: "Urutan", field: "sortOrder", min: 0, max: 9999 });
    const isActive = readBoolean(form, "isActive");

    const uploaded = form.get("photo");
    let photoPath: string | undefined;
    if (uploaded instanceof File && uploaded.size > 0) {
      photoPath = await saveUploadedFile(uploaded, "uploads/org", {
        maxBytes: 2 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
      });
    }

    await prisma.organizationMember.update({
      where: { id },
      data: {
        positionTitle,
        name,
        parentId,
        whatsapp,
        sortOrder,
        isActive,
        ...(photoPath ? { photoPath } : {}),
      },
    });
    return redirectWithFeedback(req, "/admin/pengurus", { ok: "Data pengurus berhasil diperbarui." });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return redirectWithFeedback(req, `/admin/pengurus/${id}/edit`, {
        err: error.message,
        query: { field: error.field },
      });
    }
    if (error instanceof UploadValidationError) {
      return redirectWithFeedback(req, `/admin/pengurus/${id}/edit`, {
        err: error.message,
        query: { field: "photo" },
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return redirectWithFeedback(req, "/admin/pengurus", { err: "Data pengurus tidak ditemukan." });
      }
      if (error.code === "P2003") {
        return redirectWithFeedback(req, `/admin/pengurus/${id}/edit`, {
          err: "Parent/atasan tidak valid.",
          query: { field: "parentId" },
        });
      }
    }
    return redirectWithFeedback(req, `/admin/pengurus/${id}/edit`, { err: "Gagal memperbarui data pengurus." });
  }
}
