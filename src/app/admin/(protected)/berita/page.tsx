import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateID } from "@/lib/date";

export default async function AdminBeritaList() {
  const items = await prisma.news.findMany({ orderBy: [{ createdAt: "desc" }] });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Berita</h1>
        <Link className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800" href="/admin/berita/new">
          Tambah
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-2">Judul</th>
              <th className="p-2">Publish</th>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id} className="border-b">
                <td className="p-2 font-semibold">{n.title}</td>
                <td className="p-2">{n.isPublished ? "Ya" : "Draft"}</td>
                <td className="p-2">{n.publishedAt ? formatDateID(n.publishedAt) : "-"}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <Link className="underline" href={`/admin/berita/${n.id}/edit`}>Edit</Link>
                    <form action={`/api/admin/news/${n.id}/delete`} method="post">
                      <button className="underline text-red-600" type="submit">Hapus</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="p-2 text-slate-600" colSpan={4}>Belum ada berita.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
