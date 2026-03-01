import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { monthNameID } from "@/lib/date";

type SearchValue = string | string[] | undefined;

function takeFirst(value: SearchValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseMonth(value: SearchValue, fallback: number): number {
  const n = Number(takeFirst(value));
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n;
  return fallback;
}

function parseYear(value: SearchValue, fallback: number): number {
  const n = Number(takeFirst(value));
  if (Number.isInteger(n) && n >= 2000 && n <= 2100) return n;
  return fallback;
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function getPrevPeriod(month: number, year: number) {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

function getNextPeriod(month: number, year: number) {
  if (month === 12) return { month: 1, year: year + 1 };
  return { month: month + 1, year };
}

function buildSetoranPeriodHref(month: number, year: number, q: string) {
  const params = new URLSearchParams();
  params.set("month", String(month));
  params.set("year", String(year));
  if (q) params.set("q", q);
  return `/admin/gkoin/setoran?${params.toString()}`;
}

export default async function AdminSetoranPage({
  searchParams,
}: {
  searchParams?: { month?: SearchValue; year?: SearchValue; q?: SearchValue; field?: SearchValue };
}) {
  const now = new Date();
  const selectedMonth = parseMonth(searchParams?.month, now.getMonth() + 1);
  const selectedYear = parseYear(searchParams?.year, now.getFullYear());
  const rawSearchQuery = (takeFirst(searchParams?.q) ?? "").trim();
  const searchQuery = rawSearchQuery.toLowerCase();
  const errorField = takeFirst(searchParams?.field);

  const prevPeriod = getPrevPeriod(selectedMonth, selectedYear);
  const nextPeriod = getNextPeriod(selectedMonth, selectedYear);

  const [allDusun, depositsThisPeriod, depositsPrevPeriod, recentDeposits] = await Promise.all([
    prisma.gkoinDusun.findMany({ orderBy: { name: "asc" } }),
    prisma.gkoinDeposit.findMany({
      where: { month: selectedMonth, year: selectedYear },
      include: { dusun: true },
      orderBy: { dusun: { name: "asc" } },
    }),
    prisma.gkoinDeposit.findMany({
      where: { month: prevPeriod.month, year: prevPeriod.year },
      select: { dusunId: true, amount: true },
    }),
    prisma.gkoinDeposit.findMany({
      include: { dusun: true },
      orderBy: [{ year: "desc" }, { month: "desc" }, { dusun: { name: "asc" } }],
      take: 120,
    }),
  ]);

  const periodByDusun = new Map(depositsThisPeriod.map((x) => [x.dusunId, x]));
  const prevByDusun = new Map(depositsPrevPeriod.map((x) => [x.dusunId, x.amount]));

  const dusun = searchQuery
    ? allDusun.filter((d) => d.name.toLowerCase().includes(searchQuery))
    : allDusun;

  const totalDusun = allDusun.length;
  const sudahSetor = depositsThisPeriod.length;
  const belumSetor = Math.max(0, totalDusun - sudahSetor);
  const completion = totalDusun > 0 ? Math.round((sudahSetor / totalDusun) * 100) : 0;

  const totalThisPeriod = depositsThisPeriod.reduce((acc, x) => acc + x.amount, 0);
  const totalPrevPeriod = depositsPrevPeriod.reduce((acc, x) => acc + x.amount, 0);
  const deltaTotal = totalThisPeriod - totalPrevPeriod;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">G-Koin — Setoran Bulanan</h1>
          <p className="mt-2 text-sm text-slate-600">Input, pantau, dan validasi setoran per dusun agar progres bulanan mudah dibaca.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildSetoranPeriodHref(prevPeriod.month, prevPeriod.year, rawSearchQuery)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← {monthNameID(prevPeriod.month)} {prevPeriod.year}
          </Link>
          <Link
            href={buildSetoranPeriodHref(nextPeriod.month, nextPeriod.year, rawSearchQuery)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {monthNameID(nextPeriod.month)} {nextPeriod.year} →
          </Link>
        </div>
      </div>

      <form className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[160px_180px_1fr_auto]" method="get">
        <div>
          <label className="text-sm font-semibold">Bulan</label>
          <select name="month" defaultValue={selectedMonth} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{monthNameID(m)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Tahun</label>
          <input name="year" type="number" defaultValue={selectedYear} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-semibold">Cari Dusun (opsional)</label>
          <input name="q" defaultValue={rawSearchQuery} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Contoh: Krajan" />
        </div>
        <div className="flex items-end gap-2">
          <button className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800" type="submit">Terapkan</button>
          <Link href="/admin/gkoin/setoran" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Reset
          </Link>
        </div>
      </form>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Periode Aktif</div>
          <div className="mt-1 text-xl font-bold text-slate-900">{monthNameID(selectedMonth)} {selectedYear}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sudah Setor</div>
          <div className="mt-1 text-xl font-bold text-emerald-700">{sudahSetor} Dusun</div>
          <div className="mt-1 text-xs text-slate-600">Dari total {totalDusun} dusun</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Belum Setor</div>
          <div className="mt-1 text-xl font-bold text-amber-700">{belumSetor} Dusun</div>
          <div className="mt-1 text-xs text-slate-600">Perlu follow up</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Periode</div>
          <div className="mt-1 text-xl font-bold text-slate-900">{formatRupiah(totalThisPeriod)}</div>
          <div className={`mt-1 text-xs ${deltaTotal >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {deltaTotal >= 0 ? "+" : "-"}{formatRupiah(Math.abs(deltaTotal))} vs periode sebelumnya
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-brand-900">Progress Setoran Dusun</div>
          <div className="text-sm font-semibold text-brand-800">{completion}%</div>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-100">
          <div className="h-full rounded-full bg-brand-700" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="font-semibold text-slate-900">Input Cepat Setoran ({monthNameID(selectedMonth)} {selectedYear})</div>
        <p className="mt-1 text-sm text-slate-600">Form ini untuk input cepat satu dusun, lalu data langsung masuk tabel status di bawah.</p>

        <form className="mt-4 grid gap-3 md:grid-cols-3" action="/api/admin/gkoin/setoran/upsert" method="post">
          <input type="hidden" name="month" value={selectedMonth} />
          <input type="hidden" name="year" value={selectedYear} />
          {rawSearchQuery && <input type="hidden" name="q" value={rawSearchQuery} />}

          <div>
            <label className="text-sm font-semibold">Dusun</label>
            <select
              name="dusunId"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "dusunId" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
              required
              disabled={allDusun.length === 0}
            >
              {allDusun.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Jumlah (Rp)</label>
            <input
              name="amount"
              type="number"
              min={0}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "amount" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Nama Penyetor</label>
            <input
              name="depositorName"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "depositorName" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
              placeholder="Opsional"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Tanggal Input</label>
            <input
              name="inputDate"
              type="date"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "inputDate" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Keterangan</label>
            <input
              name="note"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "note" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
              placeholder="Opsional"
            />
          </div>
          <div className="md:col-span-3">
            <button
              className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              type="submit"
              disabled={allDusun.length === 0}
            >
              Simpan / Update
            </button>
          </div>
        </form>

        {allDusun.length === 0 && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Belum ada dusun. Tambahkan dulu di menu Dusun sebelum input setoran.
          </div>
        )}
      </div>

      {depositsThisPeriod.length === 0 && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Belum ada data setoran untuk periode {monthNameID(selectedMonth)} {selectedYear}.
        </div>
      )}

      {allDusun.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <div className="border-b bg-slate-50 px-4 py-3">
            <div className="font-semibold text-slate-900">Status Setoran per Dusun</div>
            <div className="text-sm text-slate-600">Periode {monthNameID(selectedMonth)} {selectedYear}</div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="p-2">Dusun</th>
                <th className="p-2">Status</th>
                <th className="p-2">Setoran Saat Ini</th>
                <th className="p-2">Bulan Lalu</th>
                <th className="p-2">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody>
              {dusun.map((d) => {
                const current = periodByDusun.get(d.id);
                const prevAmount = prevByDusun.get(d.id) ?? 0;
                const statusFilled = Boolean(current);

                return (
                  <tr key={d.id} className="border-b align-top">
                    <td className="p-2 font-semibold text-slate-800">{d.name}</td>
                    <td className="p-2">
                      {statusFilled ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Sudah Setor</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Belum Setor</span>
                      )}
                    </td>
                    <td className="p-2">
                      {current ? (
                        <div>
                          <div className="font-semibold text-slate-900">{formatRupiah(current.amount)}</div>
                          <div className="text-xs text-slate-500">Penyetor: {current.depositorName ?? "-"}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-2">
                      {prevAmount > 0 ? (
                        <div>
                          <div className="font-semibold text-slate-700">{formatRupiah(prevAmount)}</div>
                          {current && prevAmount > 0 && (
                            <div className={`text-xs ${current.amount >= prevAmount ? "text-emerald-700" : "text-red-700"}`}>
                              {current.amount >= prevAmount ? "+" : "-"}
                              {formatRupiah(Math.abs(current.amount - prevAmount))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <form className="flex flex-wrap items-center gap-2" action="/api/admin/gkoin/setoran/upsert" method="post">
                          <input type="hidden" name="dusunId" value={d.id} />
                          <input type="hidden" name="month" value={selectedMonth} />
                          <input type="hidden" name="year" value={selectedYear} />
                          {rawSearchQuery && <input type="hidden" name="q" value={rawSearchQuery} />}
                          <input
                            name="amount"
                            type="number"
                            min={0}
                            required
                            defaultValue={current?.amount ?? ""}
                            className="w-28 rounded-md border border-slate-200 px-2 py-1"
                            placeholder="Nominal"
                          />
                          <input
                            name="depositorName"
                            defaultValue={current?.depositorName ?? ""}
                            className="w-36 rounded-md border border-slate-200 px-2 py-1"
                            placeholder="Penyetor"
                          />
                          <button className="rounded-md bg-brand-900 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-800" type="submit">
                            {current ? "Update" : "Simpan"}
                          </button>
                        </form>

                        {current && (
                          <form action={`/api/admin/gkoin/setoran/${current.id}/delete`} method="post">
                            <input type="hidden" name="month" value={selectedMonth} />
                            <input type="hidden" name="year" value={selectedYear} />
                            {rawSearchQuery && <input type="hidden" name="q" value={rawSearchQuery} />}
                            <button className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100" type="submit">
                              Hapus
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {dusun.length === 0 && (
                <tr>
                  <td className="p-3 text-slate-600" colSpan={5}>Tidak ada dusun yang cocok dengan pencarian.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <div className="border-b bg-slate-50 px-4 py-3">
          <div className="font-semibold text-slate-900">Riwayat Setoran Terbaru</div>
          <div className="text-sm text-slate-600">Maksimal 120 data terbaru lintas periode.</div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-2">Periode</th>
              <th className="p-2">Dusun</th>
              <th className="p-2">Penyetor</th>
              <th className="p-2">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {recentDeposits.map((d) => (
              <tr key={d.id} className="border-b">
                <td className="p-2 font-semibold">{monthNameID(d.month)} {d.year}</td>
                <td className="p-2">{d.dusun.name}</td>
                <td className="p-2">{d.depositorName ?? "-"}</td>
                <td className="p-2">{formatRupiah(d.amount)}</td>
              </tr>
            ))}
            {recentDeposits.length === 0 && (
              <tr>
                <td className="p-3 text-slate-600" colSpan={4}>Belum ada data setoran.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
