import Link from "next/link";

export const metadata = { title: "Laporan | UPZISNU Pandanwangi 01" };

export default async function LaporanPage() {
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Laporan</h1>
      <p className="mt-3 text-lg text-slate-700">Pusat laporan resmi UPZISNU Pandanwangi 01.</p>

      <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
        <div className="text-lg font-semibold text-brand-900">Rekap Setoran G-KOIN</div>
        <p className="mt-2 text-sm text-brand-800">
          Lihat ringkasan laporan bulanan/tahunan. Unduh dokumen template (PDF/XLSX) khusus admin.
        </p>
        <div className="mt-4">
          <Link
            href="/laporan/gkoin"
            className="inline-flex rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Buka Laporan G-KOIN
          </Link>
        </div>
      </div>
    </div>
  );
}
