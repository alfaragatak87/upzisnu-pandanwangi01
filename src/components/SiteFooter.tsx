import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function SiteFooter() {
  const s = await prisma.siteSetting.findFirst();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 bg-brand-900 text-white">
      {/* Konten utama footer */}
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        {/* Kolom identitas & alamat */}
        <div>
          <div className="text-lg font-bold">{s?.brandNameDisplay ?? "UPZISNU Pandanwangi 01"}</div>
          <div className="mt-3 text-base opacity-90">{s?.address}</div>
          <div className="mt-3 text-base opacity-90">Jam layanan: {s?.serviceHours}</div>
        </div>
        {/* Kolom kontak */}
        <div>
          <div className="text-lg font-bold">Kontak</div>
          <div className="mt-3 text-base opacity-90">WhatsApp: {s?.whatsappNumber}</div>
          <div className="text-base opacity-90">Email: {s?.email}</div>
          <div className="mt-4 flex flex-wrap gap-4 text-base">
            {s?.socialTikTok && (
              <Link className="underline hover:text-brand-300" href={s.socialTikTok} target="_blank">
                TikTok
              </Link>
            )}
            {s?.socialFacebook && (
              <Link className="underline hover:text-brand-300" href={s.socialFacebook} target="_blank">
                Facebook
              </Link>
            )}
            {s?.instagramEnabled && s?.socialInstagram && (
              <Link className="underline hover:text-brand-300" href={s.socialInstagram} target="_blank">
                Instagram
              </Link>
            )}
          </div>
        </div>
        {/* Kolom donasi */}
        <div>
          <div className="text-lg font-bold">Donasi</div>
          <div className="mt-3 text-base opacity-90">{s?.donationBankName}</div>
          <div className="text-base opacity-90">No Rek: {s?.donationAccountNumber}</div>
          <div className="text-base opacity-90">A/N: {s?.donationAccountHolder}</div>
          <div className="mt-5">
            <Link
              href="/donasi"
              className="inline-flex rounded-lg bg-brand-700 px-4 py-3 text-base font-semibold text-white hover:bg-brand-600"
            >
              Lihat Cara Donasi
            </Link>
          </div>
        </div>
      </div>
      {/* Bottom bar */}
      <div className="border-t border-white/20 py-4">
        <div className="container-page text-sm opacity-90">
          © {year} {s?.brandNameDisplay ?? "UPZISNU Pandanwangi 01"} — Amanah & Transparan
        </div>
      </div>
    </footer>
  );
}
