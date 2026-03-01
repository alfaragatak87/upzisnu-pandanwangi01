import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type ProgramEditPageProps = {
  params: { id: string };
  searchParams?: { err?: string; field?: string };
};

export default async function ProgramEditPage({ params, searchParams }: ProgramEditPageProps) {
  const p = await prisma.program.findUnique({ where: { id: params.id } });
  if (!p) return notFound();
  const errorMessage = searchParams?.err;
  const errorField = searchParams?.field;
  return (
    <div>
      <Link href="/admin/program" className="text-sm font-semibold underline">← Kembali</Link>
      <h1 className="mt-3 text-xl font-bold">Edit Program</h1>
      <form className="mt-6 space-y-4" action={`/api/admin/program/${p.id}/update`} method="post" encType="multipart/form-data">
        {errorMessage && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
        )}
        <div>
          <label className="text-sm font-semibold">Judul</label>
          <input
            name="title"
            defaultValue={p.title}
            className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "title" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Kategori</label>
          <input
            name="category"
            defaultValue={p.category}
            className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "category" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Deskripsi</label>
          <textarea
            name="description"
            defaultValue={p.description}
            className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "description" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            rows={6}
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">Urutan</label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={p.sortOrder}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "sortOrder" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            />
          </div>
          <div className="flex items-end gap-2">
            <input id="isActive" name="isActive" type="checkbox" defaultChecked={p.isActive} />
            <label htmlFor="isActive" className="text-sm font-semibold">Aktif</label>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold">Gambar baru (opsional)</label>
          <input name="image" type="file" accept="image/*" className="mt-1 w-full" />
          {errorField === "image" && <div className="mt-1 text-xs text-rose-700">File gambar tidak valid.</div>}
          {p.imagePath && <div className="mt-2 text-xs text-slate-600">Saat ini: {p.imagePath}</div>}
        </div>
        <button className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800" type="submit">Simpan</button>
      </form>
    </div>
  );
}
