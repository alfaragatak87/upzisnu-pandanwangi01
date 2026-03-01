import { prisma } from "@/lib/prisma";
import { AdminValidationError } from "@/lib/admin-form";

export async function validateOrgParentForCreate(parentId: string | null) {
  if (!parentId) return null;

  const parent = await prisma.organizationMember.findUnique({
    where: { id: parentId },
    select: { id: true },
  });
  if (!parent) {
    throw new AdminValidationError("Parent/atasan tidak ditemukan.", "parentId");
  }

  return parentId;
}

export async function validateOrgParentForUpdate(memberId: string, parentId: string | null) {
  if (!parentId) return null;
  if (parentId === memberId) {
    throw new AdminValidationError("Parent tidak boleh diri sendiri.", "parentId");
  }

  const parent = await prisma.organizationMember.findUnique({
    where: { id: parentId },
    select: { id: true, parentId: true },
  });
  if (!parent) {
    throw new AdminValidationError("Parent/atasan tidak ditemukan.", "parentId");
  }

  let cursor: string | null = parent.id;
  while (cursor) {
    if (cursor === memberId) {
      throw new AdminValidationError("Relasi parent menyebabkan loop struktur.", "parentId");
    }
    const node: { parentId: string | null } | null = await prisma.organizationMember.findUnique({
      where: { id: cursor },
      select: { parentId: true },
    });
    cursor = node?.parentId ?? null;
  }

  return parentId;
}
