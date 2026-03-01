import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CopyButton } from "@/components/CopyButton";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { formatDateID } from "@/lib/date";

function SocialIcon({ type }: { type: "tiktok" | "facebook" | "instagram" }) {
  if (type === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M16.75 2h2.55c.17 1.4.96 2.72 2.2 3.48.9.56 1.96.87 3 .87v2.7c-1.63-.05-3.22-.54-4.55-1.42v6.87c0 3.75-3.04 6.79-6.79 6.79S6.37 18.25 6.37 14.5s3.04-6.79 6.79-6.79c.41 0 .82.04 1.21.11v2.82a3.94 3.94 0 0 0-1.21-.19 4.05 4.05 0 1 0 4.05 4.05V2h-.46z" />
      </svg>
    );
  }

  if (type === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.86c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.26.2 2.26.2v2.48h-1.27c-1.25 0-1.64.78-1.64 1.58v1.9h2.8l-.45 2.9h-2.35V22c4.78-.76 8.43-4.92 8.43-9.94z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm6-3.25a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 18 6.25z" />
    </svg>
  );
}

export default async function HomePage() {
  const s = await prisma.siteSetting.findFirst();
  const waMe = s?.whatsappWaMe ?? "6285134739466";

  const confirmMsg =
    "Assalamu’alaikum. Saya ingin konfirmasi donasi untuk UPZISNU Pandanwangi 01.\n\nNama: \nTanggal Transfer: \nNominal: \nMetode: (Transfer/QRIS)\nBukti transfer: (jika ada)\n\nMohon dicek, terima kasih.";

  const latestNews = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const socialItems = [
    { key: "tiktok" as const, label: "TikTok", href: s?.socialTikTok ?? "", active: Boolean(s?.socialTikTok) },
    { key: "facebook" as const, label: "Facebook", href: s?.socialFacebook ?? "", active: Boolean(s?.socialFacebook) },
    {
      key: "instagram" as const,
      label: "Instagram",
      href: s?.socialInstagram ?? "",
      active: Boolean(s?.instagramEnabled && s?.socialInstagram),
    },
  ].filter((item) => item.active);

  return (
    <div>
      <section className="bg-brand-900 text-white">
        <div className="container-page grid gap-8 py-16 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">{s?.homeHeadline}</h1>
            <p className="text-white/90 text-lg">{s?.homeSubheadline}</p>
            <div className="flex flex-wrap gap-4">
              <WhatsAppCta waMe={waMe} text={s?.ctaText ?? "Hubungi via WhatsApp"} message={confirmMsg} />
              <Link
                href="/donasi"
                className="inline-flex items-center justify-center rounded-lg bg-white/20 px-5 py-3 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                Lihat Cara Donasi
              </Link>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-lg">
            <Image src="/brand/hero.jpg" alt="Kegiatan UPZISNU" fill className="object-cover" priority />
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 via-white to-brand-50 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-brand-700">Paling Aktif</div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Ikuti Media Sosial LAZISNU Pandanwangi 01</h2>
              <p className="mt-2 text-sm text-slate-600">Update kegiatan, dokumentasi penyaluran, dan info program kami lebih cepat di sosial media.</p>
            </div>
            <Link href="/kontak" className="rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-100">
              Lihat Semua Kontak
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {socialItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                target="_blank"
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-900 p-2 text-white transition group-hover:bg-brand-900">
                    <SocialIcon type={item.key} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-500">Kunjungi akun resmi</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-700">Buka</span>
              </Link>
            ))}
            {socialItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600 sm:col-span-3">
                Link media sosial belum diisi dari pengaturan admin.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow">
            <div className="text-base font-semibold text-slate-700">Donasi Cepat</div>
            <div className="mt-2 text-sm text-slate-600">Transfer ke:</div>
            <div className="mt-1 text-xl font-extrabold tracking-tight">{s?.donationBankName}</div>
            <div className="text-sm text-slate-700">No Rek: <span className="font-semibold">{s?.donationAccountNumber}</span></div>
            <div className="text-sm text-slate-700">A/N: <span className="font-semibold">{s?.donationAccountHolder}</span></div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <CopyButton value={s?.donationAccountNumber ?? ""} />
              <WhatsAppCta waMe={waMe} text="Konfirmasi WA" message={confirmMsg} className="!bg-brand-700 !px-4 !py-2 !text-sm" />
            </div>
            <div className="mt-5">
              <div className="text-sm font-semibold text-slate-700">QRIS</div>
              <div className="relative mt-2 aspect-square max-w-[200px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <Image src="/brand/qris.png" alt="QRIS UPZISNU" fill className="object-contain p-2" />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow">
              <h2 className="text-xl font-bold tracking-tight">Tujuan Website Ini</h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-slate-700">
                <li>Memudahkan donatur berdonasi dengan informasi yang jelas (rekening/QRIS & konfirmasi).</li>
                <li>Menunjukkan penyaluran dana melalui dokumentasi kegiatan dan berita.</li>
                <li>Menguatkan transparansi melalui laporan berkala yang dapat diakses publik.</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <h2 className="text-xl font-bold tracking-tight">Dana Anda Disalurkan Untuk</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Yatim","Fakir miskin","Pendidikan","Kesehatan","Sosial","Pemberdayaan"].map((x) => (
                  <div key={x} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800">{x}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold tracking-tight">Cara Berdonasi 3 Langkah</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-700">
              <li><span className="font-semibold">Transfer/QRIS</span> ke rekening UPZISNU.</li>
              <li><span className="font-semibold">Konfirmasi via WhatsApp</span> agar donasi tercatat rapi.</li>
              <li><span className="font-semibold">Dana disalurkan</span> dan <span className="font-semibold">dilaporkan berkala</span>.</li>
            </ol>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold tracking-tight">Komitmen Transparansi</h2>
            <p className="mt-4 text-slate-700">
              Kami menjaga amanah donatur dengan pencatatan tertib, penyaluran tepat sasaran,
              dokumentasi kegiatan, serta laporan berkala.
            </p>
            <div className="mt-4">
              <Link href="/laporan" className="underline text-sm font-semibold">Lihat halaman laporan</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-12">
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Berita & Kegiatan Terbaru</h2>
            <Link href="/berita" className="text-sm font-semibold text-brand-700 underline hover:text-brand-600">Lihat semua</Link>
          </div>
          <div className="mt-5 space-y-4">
            {latestNews.map((n) => (
              <Link key={n.id} href={`/berita/${n.slug}`} className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                <div className="text-sm font-semibold">{n.title}</div>
                <div className="text-xs text-slate-600">{n.publishedAt ? formatDateID(n.publishedAt) : "Draft"}</div>
              </Link>
            ))}
            {latestNews.length === 0 && <div className="text-sm text-slate-600">Belum ada berita.</div>}
          </div>
        </div>
      </section>

      <section className="container-page pb-12">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold tracking-tight">FAQ Singkat</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {[
              { q: "Saya transfer ke mana?", a: `Ke rekening ${s?.donationBankName} ${s?.donationAccountNumber} a/n ${s?.donationAccountHolder}.` },
              { q: "Uang disalurkan ke mana?", a: "Untuk program sosial, pendidikan, kesehatan, pemberdayaan, serta bantuan yatim dan fakir miskin." },
              { q: "Ada bukti kegiatan?", a: "Ada. Dokumentasi tersedia di Galeri dan Berita." },
              { q: "Ada laporan?", a: "Ada laporan berkala di halaman Laporan (PDF)." },
              { q: "Ini resmi?", a: "Kami menyediakan dokumen SK/legalitas di halaman Tentang." },
              { q: "Konfirmasi donasi gimana?", a: "Klik tombol Konfirmasi WhatsApp lalu kirim data donasi." },
            ].map((x) => (
              <div key={x.q} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="font-semibold">{x.q}</div>
                <div className="mt-1 text-sm text-slate-700">{x.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
