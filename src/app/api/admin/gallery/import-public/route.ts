import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { redirectWithFeedback } from "@/lib/admin-feedback";

export const runtime = "nodejs";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function toCaption(imagePath: string): string {
  const ext = path.extname(imagePath);
  const base = path.basename(imagePath, ext).replace(/[-_]+/g, " ").trim();
  return base.length > 0 ? base : "Foto Galeri";
}

async function collectImagePathsFromPublic(rootDir: string, relativeDir = ""): Promise<string[]> {
  const currentDir = path.join(rootDir, relativeDir);
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const found: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const nextRelative = relativeDir ? path.join(relativeDir, entry.name) : entry.name;

    if (entry.isDirectory()) {
      const nested = await collectImagePathsFromPublic(rootDir, nextRelative);
      found.push(...nested);
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;

    const imagePath = `/${nextRelative}`.replace(/\\/g, "/");
    found.push(imagePath);
  }

  return found;
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  try {
    const existingAlbum = await prisma.galleryAlbum.findFirst({
      where: { title: "Dokumentasi Kegiatan" },
      select: { id: true },
    });

    const albumId =
      existingAlbum?.id ??
      (
        await prisma.galleryAlbum.create({
          data: { title: "Dokumentasi Kegiatan", description: "Album hasil import otomatis dari folder public." },
          select: { id: true },
        })
      ).id;

    const publicDir = path.join(process.cwd(), "public");
    const publicImages = await collectImagePathsFromPublic(publicDir);

    if (publicImages.length === 0) {
      return redirectWithFeedback(req, "/admin/galeri", { err: "Tidak ditemukan gambar pada folder public." });
    }

    const existingPhotoPaths = await prisma.galleryPhoto.findMany({
      where: { albumId },
      select: { imagePath: true },
    });
    const existingSet = new Set(existingPhotoPaths.map((x) => x.imagePath));
    const toImport = publicImages.filter((x) => !existingSet.has(x));

    if (toImport.length === 0) {
      return redirectWithFeedback(req, "/admin/galeri", { err: "Tidak ada gambar baru untuk di-import." });
    }

    const maxSort = await prisma.galleryPhoto.findFirst({
      where: { albumId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const sortBase = maxSort?.sortOrder ?? 0;
    const now = new Date();

    await prisma.galleryPhoto.createMany({
      data: toImport.map((imagePath, idx) => ({
        albumId,
        imagePath,
        caption: toCaption(imagePath),
        takenAt: now,
        sortOrder: sortBase + idx + 1,
        isVisible: true,
      })),
    });

    return redirectWithFeedback(req, "/admin/galeri", { ok: `Import selesai: ${toImport.length} gambar ditambahkan.` });
  } catch {
    return redirectWithFeedback(req, "/admin/galeri", { err: "Gagal import otomatis dari folder public." });
  }
}
