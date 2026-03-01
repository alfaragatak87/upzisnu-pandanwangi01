import { prisma } from "@/lib/prisma";
import { GalleryLightbox } from "@/components/GalleryLightbox";

export const metadata = { title: "Galeri | UPZISNU Pandanwangi 01" };

export default async function GaleriPage() {
  const album = await prisma.galleryAlbum.findFirst({ where: { title: "Dokumentasi Kegiatan" } });
  const photos = album ? await prisma.galleryPhoto.findMany({
    where: { albumId: album.id, isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  }) : [];

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Galeri</h1>
      <p className="mt-3 text-lg text-slate-700">Dokumentasi kegiatan. Klik foto untuk melihat lebih jelas.</p>
      <div className="mt-8 rounded-2xl bg-white p-6 shadow">
        <GalleryLightbox items={photos.map((p) => ({ id: p.id, imagePath: p.imagePath, caption: p.caption, takenAt: p.takenAt.toISOString() }))} />
        {photos.length === 0 && <div className="mt-4 text-sm text-slate-600">Belum ada foto.</div>}
      </div>
    </div>
  );
}
