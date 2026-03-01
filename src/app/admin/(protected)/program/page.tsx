import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminProgramList() {
  const items = await prisma.program.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Program</h1>
        <Link className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800" href="/admin/program/new">
          Tambah
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-2">Judul</th>
              <th className="p-2">Kategori</th>
              <th className="p-2">Aktif</th>
              <th className="p-2">Urutan</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-2 font-semibold">{p.title}</td>
                <td className="p-2">{p.category}</td>
                <td className="p-2">{p.isActive ? "Ya" : "Tidak"}</td>
                <td className="p-2">{p.sortOrder}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <Link className="underline" href={`/admin/program/${p.id}/edit`}>Edit</Link>
                    <form action={`/api/admin/program/${p.id}/delete`} method="post">
                      <button className="underline text-red-600" type="submit">Hapus</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="p-2 text-slate-600" colSpan={5}>Belum ada program.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
