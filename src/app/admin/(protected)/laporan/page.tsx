import { prisma } from "@/lib/prisma";
import { monthNameID } from "@/lib/date";

type AdminLaporanPageProps = {
  searchParams?: { err?: string; field?: string };
};

export default async function AdminLaporanPage({ searchParams }: AdminLaporanPageProps) {
  const reports = await prisma.monthlyReport.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] });
  const errorMessage = searchParams?.err;
  const errorField = searchParams?.field;

  return (
    <div>
      <h1 className="text-xl font-bold">Laporan Bulanan</h1>
      <p className="mt-2 text-sm text-slate-600">Upload 2 PDF per bulan: pemasukan dan pengeluaran/penyaluran.</p>

      <form className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4" action="/api/admin/reports/upsert" method="post" encType="multipart/form-data">
        {errorMessage && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
        )}
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">Bulan (1-12)</label>
            <input
              name="month"
              type="number"
              min={1}
              max={12}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "month" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Tahun</label>
            <input
              name="year"
              type="number"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "year" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Catatan (opsional)</label>
            <input
              name="notes"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "notes" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">PDF Pemasukan</label>
            <input name="incomePdf" type="file" accept="application/pdf" className="mt-1 w-full" />
          </div>
          <div>
            <label className="text-sm font-semibold">PDF Pengeluaran/Penyaluran</label>
            <input name="expensePdf" type="file" accept="application/pdf" className="mt-1 w-full" />
          </div>
        </div>
        {(errorField === "incomePdf" || errorField === "expensePdf") && (
          <div className="text-xs text-rose-700">Pastikan file yang diunggah berupa PDF dan ukurannya sesuai.</div>
        )}
        <button className="w-fit rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800" type="submit">Simpan / Update</button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-2">Bulan</th>
              <th className="p-2">Pemasukan</th>
              <th className="p-2">Pengeluaran</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2 font-semibold">{monthNameID(r.month)} {r.year}</td>
                <td className="p-2">{r.incomePdfPath ? "Ada" : "Belum"}</td>
                <td className="p-2">{r.expensePdfPath ? "Ada" : "Belum"}</td>
                <td className="p-2">
                  <form action={`/api/admin/reports/${r.id}/delete`} method="post">
                    <button className="underline text-red-600" type="submit">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
            {reports.length === 0 && <tr><td className="p-2 text-slate-600" colSpan={4}>Belum ada laporan.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
