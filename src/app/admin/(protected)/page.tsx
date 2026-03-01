import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { monthNameID } from "@/lib/date";

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default async function AdminDashboard() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [newsCount, photoCount, reportCount, dusunCount, programCount, depositsThisMonth, recentNews, recentPrograms] = await Promise.all([
    prisma.news.count(),
    prisma.galleryPhoto.count(),
    prisma.monthlyReport.count(),
    prisma.gkoinDusun.count(),
    prisma.program.count(),
    prisma.gkoinDeposit.findMany({ where: { month, year }, include: { dusun: true } }),
    prisma.news.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.program.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
  ]);

  const setorCount = depositsThisMonth.length;
  const belumSetorCount = Math.max(0, dusunCount - setorCount);
  const completion = dusunCount > 0 ? Math.round((setorCount / dusunCount) * 100) : 0;
  const totalSetoranBulanIni = depositsThisMonth.reduce((acc, x) => acc + x.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
      <p className="mt-2 text-sm text-slate-600">Ringkasan operasional dan progres utama untuk tim admin.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Program", value: programCount, href: "/admin/program" },
          { label: "Berita", value: newsCount, href: "/admin/berita" },
          { label: "Foto Galeri", value: photoCount, href: "/admin/galeri" },
          { label: "Laporan Bulanan", value: reportCount, href: "/admin/laporan" },
        ].map((x) => (
          <Link key={x.label} href={x.href} className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-200 hover:bg-white hover:shadow-sm">
            <div className="text-sm font-semibold text-slate-700">{x.label}</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{x.value}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-brand-900">G-Koin Bulan Berjalan</div>
            <div className="mt-1 text-sm text-brand-800">
              Periode {monthNameID(month)} {year}
            </div>
          </div>
          <Link href={`/admin/gkoin/setoran?month=${month}&year=${year}`} className="rounded-md bg-brand-900 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-800">
            Input Setoran Sekarang
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-brand-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">Progress Dusun</div>
            <div className="mt-1 text-xl font-bold text-slate-900">{setorCount} / {dusunCount}</div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-100">
              <div className="h-full rounded-full bg-brand-700" style={{ width: `${completion}%` }} />
            </div>
            <div className="mt-2 text-xs text-slate-600">{completion}% dusun sudah setor</div>
          </div>

          <div className="rounded-lg border border-brand-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">Belum Setor</div>
            <div className="mt-1 text-xl font-bold text-slate-900">{belumSetorCount} Dusun</div>
            <div className="mt-2 text-xs text-slate-600">Pantau dan follow up dusun yang belum setor.</div>
          </div>

          <div className="rounded-lg border border-brand-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">Total Setoran</div>
            <div className="mt-1 text-xl font-bold text-slate-900">{formatRupiah(totalSetoranBulanIni)}</div>
            <div className="mt-2 text-xs text-slate-600">Akumulasi pemasukan G-Koin periode berjalan.</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          { label: "Input Setoran G-Koin", href: `/admin/gkoin/setoran?month=${month}&year=${year}` },
          { label: "Tambah Berita", href: "/admin/berita/new" },
          { label: "Tambah Program", href: "/admin/program/new" },
        ].map((x) => (
          <Link
            key={x.label}
            href={x.href}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-brand-200 hover:bg-brand-50"
          >
            {x.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-slate-900">Update Berita Terakhir</div>
            <Link href="/admin/berita" className="text-xs font-semibold text-brand-800 hover:underline">Lihat Semua</Link>
          </div>
          <div className="mt-3 space-y-2">
            {recentNews.map((item) => (
              <Link key={item.id} href={`/admin/berita/${item.id}/edit`} className="block rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                <div className="font-semibold text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-500">Terakhir diubah: {new Date(item.updatedAt).toLocaleString("id-ID")}</div>
              </Link>
            ))}
            {recentNews.length === 0 && <div className="text-sm text-slate-600">Belum ada berita.</div>}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-slate-900">Update Program Terakhir</div>
            <Link href="/admin/program" className="text-xs font-semibold text-brand-800 hover:underline">Lihat Semua</Link>
          </div>
          <div className="mt-3 space-y-2">
            {recentPrograms.map((item) => (
              <Link key={item.id} href={`/admin/program/${item.id}/edit`} className="block rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                <div className="font-semibold text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-500">Terakhir diubah: {new Date(item.updatedAt).toLocaleString("id-ID")}</div>
              </Link>
            ))}
            {recentPrograms.length === 0 && <div className="text-sm text-slate-600">Belum ada program.</div>}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Dusun (G-Koin)", value: dusunCount, href: "/admin/gkoin/dusun" },
          { label: "Sudah Setor Bulan Ini", value: setorCount, href: `/admin/gkoin/setoran?month=${month}&year=${year}` },
          { label: "Belum Setor Bulan Ini", value: belumSetorCount, href: `/admin/gkoin/setoran?month=${month}&year=${year}` },
          { label: "Nominal Bulan Ini", value: formatRupiah(totalSetoranBulanIni), href: `/admin/gkoin/setoran?month=${month}&year=${year}` },
        ].map((x) => (
          <Link key={`${x.label}-${x.href}`} href={x.href} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
            <div className="text-sm font-semibold text-slate-700">{x.label}</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{x.value}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
