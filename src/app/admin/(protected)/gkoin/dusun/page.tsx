import { prisma } from "@/lib/prisma";

type AdminDusunPageProps = {
  searchParams?: { field?: string; err?: string };
};

export default async function AdminDusunPage({ searchParams }: AdminDusunPageProps) {
  const dusun = await prisma.gkoinDusun.findMany({ orderBy: { name: "asc" } });
  const maxDusun = 6;
  const slotTersisa = Math.max(0, maxDusun - dusun.length);
  const penuh = dusun.length >= maxDusun;
  const errorField = searchParams?.field;

  return (
    <div>
      <h1 className="text-xl font-bold">G-Koin — Dusun</h1>
      <p className="mt-2 text-sm text-slate-600">Kelola daftar dusun.</p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <div className="font-semibold text-slate-800">Slot dusun: {dusun.length}/{maxDusun}</div>
        <div className="mt-1 text-slate-600">
          {penuh ? "Slot penuh. Hapus salah satu dusun jika ingin menambah baru." : `Slot tersisa: ${slotTersisa} dusun.`}
        </div>
      </div>

      <form className="mt-6 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4" action="/api/admin/gkoin/dusun/create" method="post">
        <div className="min-w-[260px] flex-1">
          <label className="text-sm font-semibold">Nama dusun</label>
          <input
            name="name"
            className={`mt-1 w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${errorField === "name" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            required
            disabled={penuh}
          />
        </div>
        <div className="flex items-end">
          <button
            className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={penuh}
          >
            Tambah
          </button>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-2">Nama</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dusun.map((d) => (
              <tr key={d.id} className="border-b">
                <td className="p-2 font-semibold">{d.name}</td>
                <td className="p-2">
                  <form action={`/api/admin/gkoin/dusun/${d.id}/delete`} method="post">
                    <button className="underline text-red-600" type="submit">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
            {dusun.length === 0 && <tr><td className="p-2 text-slate-600" colSpan={2}>Belum ada dusun.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
