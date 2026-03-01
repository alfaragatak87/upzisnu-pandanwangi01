import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type BeritaEditPageProps = {
  params: { id: string };
  searchParams?: { err?: string; field?: string };
};

export default async function BeritaEditPage({ params, searchParams }: BeritaEditPageProps) {
  const n = await prisma.news.findUnique({ where: { id: params.id } });
  if (!n) return notFound();
  const errorMessage = searchParams?.err;
  const errorField = searchParams?.field;
  return (
    <div>
      <Link href="/admin/berita" className="text-sm font-semibold underline">← Kembali</Link>
      <h1 className="mt-3 text-xl font-bold">Edit Berita</h1>
      <form className="mt-6 space-y-4" action={`/api/admin/news/${n.id}/update`} method="post" encType="multipart/form-data">
        {errorMessage && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
        )}
        <div>
          <label className="text-sm font-semibold">Judul</label>
          <input
            name="title"
            defaultValue={n.title}
            className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "title" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Cover image baru (opsional)</label>
          <input name="cover" type="file" accept="image/*" className="mt-1 w-full" />
          {errorField === "cover" && <div className="mt-1 text-xs text-rose-700">File cover tidak valid.</div>}
          {n.coverImagePath && <div className="mt-2 text-xs text-slate-600">Saat ini: {n.coverImagePath}</div>}
        </div>
        <div>
          <label className="text-sm font-semibold">Isi (Markdown)</label>
          <textarea
            name="contentMarkdown"
            defaultValue={n.contentMarkdown}
            className={`mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm ${errorField === "contentMarkdown" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            rows={12}
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input id="isPublished" name="isPublished" type="checkbox" defaultChecked={n.isPublished} />
          <label htmlFor="isPublished" className="text-sm font-semibold">Publish</label>
        </div>
        <button className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800" type="submit">Simpan</button>
      </form>
    </div>
  );
}
