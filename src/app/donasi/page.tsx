import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CopyButton } from "@/components/CopyButton";
import { WhatsAppCta } from "@/components/WhatsAppCta";

export const metadata = { title: "Donasi | UPZISNU Pandanwangi 01" };

export default async function DonasiPage() {
  const s = await prisma.siteSetting.findFirst();
  const waMe = s?.whatsappWaMe ?? "6285134739466";
  const confirmMsg =
    "Assalamu’alaikum. Saya ingin konfirmasi donasi untuk UPZISNU Pandanwangi 01.\n\nNama: \nTanggal Transfer: \nNominal: \nMetode: (Transfer/QRIS)\nBukti transfer: (jika ada)\n\nMohon dicek, terima kasih.";

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Donasi</h1>
      <p className="mt-3 text-lg text-slate-700">Transfer/QRIS lalu konfirmasi via WhatsApp agar tercatat rapi.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Card: Rekening dan QRIS */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">Rekening Donasi</h2>
          <div className="mt-4 space-y-1 text-base text-slate-700">
            <div><span className="font-semibold">Bank:</span> {s?.donationBankName}</div>
            <div><span className="font-semibold">No Rek:</span> {s?.donationAccountNumber}</div>
            <div><span className="font-semibold">A/N:</span> {s?.donationAccountHolder}</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <CopyButton value={s?.donationAccountNumber ?? ""} />
            <WhatsAppCta waMe={waMe} text="Konfirmasi via WhatsApp" message={confirmMsg} className="!px-4 !py-2 !text-sm" />
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-slate-700">QRIS</h3>
            <div className="relative mt-2 aspect-square max-w-[260px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
              <Image src="/brand/qris.png" alt="QRIS UPZISNU" fill className="object-contain p-2" />
            </div>
          </div>
        </div>

        {/* Card: Cara Berdonasi */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">Cara Berdonasi 3 Langkah</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-base text-slate-700">
            <li><span className="font-semibold">Transfer/QRIS</span> sesuai nominal donasi.</li>
            <li><span className="font-semibold">Konfirmasi WhatsApp</span> (nama, tanggal, nominal, metode).</li>
            <li><span className="font-semibold">Dana disalurkan</span> dan dilaporkan berkala melalui dokumentasi & laporan.</li>
          </ol>

          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-base text-slate-700">
            <div className="font-semibold">Komitmen Transparansi</div>
            <p className="mt-1">Pencatatan tertib, penyaluran tepat sasaran, dokumentasi kegiatan, serta laporan berkala.</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/galeri" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-slate-100">Lihat Dokumentasi</Link>
            <Link href="/laporan" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-slate-100">Lihat Laporan</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
