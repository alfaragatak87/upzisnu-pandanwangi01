import { prisma } from "@/lib/prisma";
import { monthNameID } from "@/lib/date";

export default async function AdminRekapPage() {
  const deposits = await prisma.gkoinDeposit.findMany({ include: { dusun: true } });
  const totalAll = deposits.reduce((acc, d) => acc + d.amount, 0);
  const noData = deposits.length === 0;

  const byDusun = new Map<string, number>();
  const byMonth = new Map<string, number>();
  for (const d of deposits) {
    byDusun.set(d.dusun.name, (byDusun.get(d.dusun.name) ?? 0) + d.amount);
    const key = `${d.year}-${String(d.month).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + d.amount);
  }

  const byDusunRows = Array.from(byDusun.entries()).sort((a, b) => b[1] - a[1]);
  const byMonthRows = Array.from(byMonth.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div>
      <h1 className="text-xl font-bold">G-Koin — Rekap</h1>
      <p className="mt-2 text-sm text-slate-600">Rekap total per dusun, per bulan, dan keseluruhan.</p>

      {noData && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Belum ada data setoran untuk direkap.
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm font-semibold">Total Keseluruhan</div>
        <div className="mt-2 text-2xl font-bold">Rp {totalAll.toLocaleString("id-ID")}</div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="font-semibold">Total per Dusun</div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-slate-50 text-left"><th className="p-2">Dusun</th><th className="p-2">Total</th></tr></thead>
              <tbody>
                {byDusunRows.map(([name, total]) => (
                  <tr key={name} className="border-b"><td className="p-2 font-semibold">{name}</td><td className="p-2">Rp {total.toLocaleString("id-ID")}</td></tr>
                ))}
                {byDusunRows.length === 0 && <tr><td className="p-2 text-slate-600" colSpan={2}>Belum ada data.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="font-semibold">Total per Bulan</div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-slate-50 text-left"><th className="p-2">Periode</th><th className="p-2">Total</th></tr></thead>
              <tbody>
                {byMonthRows.map(([key, total]) => {
                  const [y, m] = key.split("-");
                  const month = Number(m);
                  return <tr key={key} className="border-b"><td className="p-2 font-semibold">{monthNameID(month)} {y}</td><td className="p-2">Rp {total.toLocaleString("id-ID")}</td></tr>;
                })}
                {byMonthRows.length === 0 && <tr><td className="p-2 text-slate-600" colSpan={2}>Belum ada data.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
