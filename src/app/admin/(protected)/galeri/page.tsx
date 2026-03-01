import { prisma } from "@/lib/prisma";

type AdminGaleriPageProps = {
  searchParams?: {
    imported?: string;
  };
};

export default async function AdminGaleriPage({ searchParams }: AdminGaleriPageProps) {
  const album = await prisma.galleryAlbum.findFirst({ where: { title: "Dokumentasi Kegiatan" } });
  if (!album) return <div>Album belum ada. Jalankan seed.</div>;

  const photos = await prisma.galleryPhoto.findMany({ where: { albumId: album.id }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  const importedCount = Number(searchParams?.imported ?? NaN);
  const hasImportInfo = Number.isFinite(importedCount);

  return (
    <div>
      <h1 className="text-xl font-bold">Galeri — Dokumentasi Kegiatan</h1>
      <p className="mt-2 text-sm text-slate-600">Upload foto + caption + tanggal.</p>

      {hasImportInfo && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {importedCount > 0
            ? `Import otomatis selesai: ${importedCount} gambar baru ditambahkan dari folder public.`
            : "Import otomatis selesai: tidak ada gambar baru untuk ditambahkan."}
        </div>
      )}

      <form className="mt-4" action="/api/admin/gallery/import-public" method="post">
        <button
          className="rounded-md border border-brand-300 bg-white px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          type="submit"
        >
          Import Otomatis dari /public
        </button>
      </form>

      <form className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4" action="/api/admin/gallery/create" method="post" encType="multipart/form-data">
        <input type="hidden" name="albumId" value={album.id} />
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Foto</label>
            {/* Allow selecting multiple images at once; fallbacks gracefully when single file is chosen. */}
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="mt-1 w-full"
              required
            />
            <p className="mt-1 text-xs text-slate-500">Pilih satu atau beberapa foto sekaligus.</p>
          </div>
          <div>
            <label className="text-sm font-semibold">Tanggal tampil</label>
            <input name="takenAt" type="date" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" />
            <div className="mt-1 text-xs text-slate-500">Kosong = otomatis hari ini.</div>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold">Caption</label>
          <input name="caption" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" required />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">Urutan</label>
            <input name="sortOrder" type="number" defaultValue={0} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" />
          </div>
          <div className="flex items-end gap-2">
            <input id="isVisible" name="isVisible" type="checkbox" defaultChecked />
            <label htmlFor="isVisible" className="text-sm font-semibold">Tampilkan</label>
          </div>
        </div>
        <button className="w-fit rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800" type="submit">Upload</button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-2">Caption</th>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Tampil</th>
              <th className="p-2">Urutan</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {photos.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-2 font-semibold">{p.caption}</td>
                <td className="p-2">{p.takenAt.toISOString().slice(0,10)}</td>
                <td className="p-2">{p.isVisible ? "Ya" : "Tidak"}</td>
                <td className="p-2">{p.sortOrder}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <form action={`/api/admin/gallery/${p.id}/toggle`} method="post">
                      <button className="underline" type="submit">{p.isVisible ? "Sembunyikan" : "Tampilkan"}</button>
                    </form>
                    <form action={`/api/admin/gallery/${p.id}/delete`} method="post">
                      <button className="underline text-red-600" type="submit">Hapus</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {photos.length === 0 && <tr><td className="p-2 text-slate-600" colSpan={5}>Belum ada foto.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
