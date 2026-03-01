import { prisma } from "@/lib/prisma";

type AdminPengurusPageProps = {
  searchParams?: { err?: string; field?: string };
};

export default async function AdminPengurusPage({ searchParams }: AdminPengurusPageProps) {
  const items = await prisma.organizationMember.findMany({ orderBy: [{ createdAt: "asc" }] });
  const errorMessage = searchParams?.err;
  const errorField = searchParams?.field;
  const memberMap = new Map(items.map((x) => [x.id, x]));

  return (
    <div>
      <h1 className="text-xl font-bold">Pengurus (Tree)</h1>
      <p className="mt-2 text-sm text-slate-600">Tambah/edit pengurus. Foto bisa menyusul.</p>

      <form className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4" action="/api/admin/org/create" method="post" encType="multipart/form-data">
        {errorMessage && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Jabatan</label>
            <input
              name="positionTitle"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "positionTitle" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Nama</label>
            <input
              name="name"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "name" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
              required
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">Parent/Atasan</label>
            <select
              name="parentId"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "parentId" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            >
              <option value="">(root)</option>
              {items.map((x) => (
                <option key={x.id} value={x.id}>{x.positionTitle} — {x.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">No WA (opsional)</label>
            <input
              name="whatsapp"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "whatsapp" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Foto (opsional)</label>
            <input name="photo" type="file" accept="image/*" className="mt-1 w-full" />
            {errorField === "photo" && <div className="mt-1 text-xs text-rose-700">File foto tidak valid.</div>}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">Urutan</label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={0}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "sortOrder" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            />
          </div>
          <div className="flex items-end gap-2">
            <input id="isActive" name="isActive" type="checkbox" defaultChecked />
            <label htmlFor="isActive" className="text-sm font-semibold">Aktif</label>
          </div>
        </div>
        <button className="w-fit rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800" type="submit">Tambah</button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-2">Jabatan</th>
              <th className="p-2">Nama</th>
              <th className="p-2">Parent</th>
              <th className="p-2">Aktif</th>
            <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id} className="border-b">
                <td className="p-2 font-semibold">{x.positionTitle}</td>
                <td className="p-2">{x.name}</td>
                <td className="p-2">
                  {x.parentId ? `${memberMap.get(x.parentId)?.positionTitle ?? "Unknown"} — ${memberMap.get(x.parentId)?.name ?? "-"}` : "-"}
                </td>
                <td className="p-2">{x.isActive ? "Ya" : "Tidak"}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    {/* Edit link allows updating existing record, including uploading a photo if missing */}
                    <a href={`/admin/pengurus/${x.id}/edit`} className="underline text-brand-900">Edit</a>
                    <form action={`/api/admin/org/${x.id}/toggle`} method="post">
                      <button className="underline" type="submit">{x.isActive ? "Nonaktifkan" : "Aktifkan"}</button>
                    </form>
                    <form action={`/api/admin/org/${x.id}/delete`} method="post">
                      <button className="underline text-red-600" type="submit">Hapus</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="p-2 text-slate-600" colSpan={5}>Belum ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
