import Link from "next/link";
import { getSession } from "@/lib/auth";
import { monthNameID } from "@/lib/date";
import {
  formatDateDDMMYYYY,
  formatRupiah,
  getGkoinMonthlyReportData,
  getGkoinYearlyReportData,
  monthShortID,
} from "@/lib/gkoin-report";

type SearchValue = string | string[] | undefined;
type Scope = "monthly" | "yearly";

function first(value: SearchValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseScope(value: SearchValue): Scope {
  return first(value) === "yearly" ? "yearly" : "monthly";
}

function parseYear(value: SearchValue, fallback: number): number {
  const n = Number(first(value));
  if (Number.isInteger(n) && n >= 2000 && n <= 2100) return n;
  return fallback;
}

function parseMonth(value: SearchValue, fallback: number): number {
  const n = Number(first(value));
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n;
  return fallback;
}

export const metadata = { title: "Laporan G-KOIN | UPZISNU Pandanwangi 01" };

export default async function GkoinLaporanPage({
  searchParams,
}: {
  searchParams?: { scope?: SearchValue; year?: SearchValue; month?: SearchValue };
}) {
  const now = new Date();
  const session = await getSession();
  const scope = parseScope(searchParams?.scope);
  const year = parseYear(searchParams?.year, now.getFullYear());
  const month = parseMonth(searchParams?.month, now.getMonth() + 1);

  const monthly = scope === "monthly" ? await getGkoinMonthlyReportData(month, year) : null;
  const yearly = scope === "yearly" ? await getGkoinYearlyReportData(year) : null;

  const exportBase = `/api/reports/gkoin/export?scope=${scope}&year=${year}${scope === "monthly" ? `&month=${month}` : ""}`;

  return (
    <div className="container-page py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-bold text-slate-900">Laporan Rekap Setoran G-KOIN</h1>
        <p className="mt-2 text-slate-600">
          Tampilan laporan mengikuti template resmi. Download dokumen hanya untuk admin yang sudah login.
        </p>

        <form className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[180px_160px_160px_auto]">
          <div>
            <label className="text-sm font-semibold text-slate-700">Jenis Rekap</label>
            <select name="scope" defaultValue={scope} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Tahun</label>
            <input name="year" type="number" defaultValue={year} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Bulan</label>
            <select name="month" defaultValue={month} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" disabled={scope !== "monthly"}>
              {Array.from({ length: 12 }, (_, idx) => idx + 1).map((m) => (
                <option key={m} value={m}>
                  {monthNameID(m)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800" type="submit">
              Tampilkan
            </button>
          </div>
        </form>

        {session ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`${exportBase}&format=pdf`}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Unduh PDF
            </Link>
            <Link
              href={`${exportBase}&format=xlsx`}
              className="rounded-md border border-brand-300 bg-white px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50"
            >
              Unduh XLSX
            </Link>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Unduh dokumen khusus admin. Silakan <Link href="/admin/login" className="font-semibold underline">login admin</Link>.
          </div>
        )}

        {monthly && (
          <>
            <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Periode" value={`${monthNameID(monthly.month)} ${monthly.year}`} />
              <StatCard label="Total Dusun" value={String(monthly.totalDusun)} />
              <StatCard label="Sudah Setor" value={String(monthly.sudahSetor)} />
              <StatCard label="Belum Setor" value={String(monthly.belumSetor)} />
              <StatCard label="Capaian" value={`${monthly.completion}%`} />
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Total Nominal: {formatRupiah(monthly.totalNominal)}
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="border-b border-slate-200 p-2">No</th>
                    <th className="border-b border-slate-200 p-2">Dusun</th>
                    <th className="border-b border-slate-200 p-2">Setoran</th>
                    <th className="border-b border-slate-200 p-2">Penyetor</th>
                    <th className="border-b border-slate-200 p-2">Tgl</th>
                    <th className="border-b border-slate-200 p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.rows.map((row) => (
                    <tr key={row.dusunId} className="border-b border-slate-100">
                      <td className="p-2">{row.no}</td>
                      <td className="p-2 font-semibold text-slate-800">{row.dusunName}</td>
                      <td className="p-2">{formatRupiah(row.amount)}</td>
                      <td className="p-2">{row.depositorName}</td>
                      <td className="p-2">{row.inputDate ? formatDateDDMMYYYY(row.inputDate) : "-"}</td>
                      <td className="p-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            row.status === "Sudah" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {yearly && (
          <>
            <div className="mt-8 grid gap-3 md:grid-cols-3 xl:grid-cols-4">
              <StatCard label="Tahun" value={String(yearly.year)} />
              <StatCard label="Total Dusun" value={String(yearly.totalDusun)} />
              <StatCard label="Rata-rata Capaian" value={`${yearly.averageCompletion}%`} />
              <StatCard label="Total Nominal" value={formatRupiah(yearly.totalNominal)} />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">Ringkasan Per Bulan</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="border-b border-slate-200 p-2">Bulan</th>
                      <th className="border-b border-slate-200 p-2">Sudah</th>
                      <th className="border-b border-slate-200 p-2">Belum</th>
                      <th className="border-b border-slate-200 p-2">Capaian</th>
                      <th className="border-b border-slate-200 p-2">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearly.monthlySummaries.map((m) => (
                      <tr key={m.month} className="border-b border-slate-100">
                        <td className="p-2">{monthNameID(m.month)}</td>
                        <td className="p-2">{m.sudahSetor}</td>
                        <td className="p-2">{m.belumSetor}</td>
                        <td className="p-2">{m.completion}%</td>
                        <td className="p-2">{formatRupiah(m.totalNominal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">Matriks Per Dusun</div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="border-b border-slate-200 p-2">Dusun</th>
                      {Array.from({ length: 12 }, (_, idx) => (
                        <th key={idx + 1} className="border-b border-slate-200 p-2">
                          {monthShortID(idx + 1)}
                        </th>
                      ))}
                      <th className="border-b border-slate-200 p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearly.matrixRows.map((row) => (
                      <tr key={row.dusunId} className="border-b border-slate-100">
                        <td className="p-2 font-semibold text-slate-800">{row.dusunName}</td>
                        {row.monthlyAmounts.map((amount, idx) => (
                          <td key={idx} className="p-2">{amount > 0 ? `${Math.round(amount / 1000)}k` : "0"}</td>
                        ))}
                        <td className="p-2 font-semibold">{formatRupiah(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-bold text-slate-900">{value}</div>
    </div>
  );
}
