import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WhatsAppCta } from "@/components/WhatsAppCta";

export const metadata = { title: "Kontak | UPZISNU Pandanwangi 01" };

export default async function KontakPage() {
  const s = await prisma.siteSetting.findFirst();
  const waMe = s?.whatsappWaMe ?? "6285134739466";
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Kontak</h1>
      <p className="mt-3 text-lg text-slate-700">Hubungi admin untuk konfirmasi donasi atau pertanyaan lainnya.</p>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="text-base font-semibold text-slate-700">Alamat</div>
            <div className="mt-1 text-slate-700">{s?.address}</div>

            <div className="mt-5 text-base font-semibold text-slate-700">WhatsApp Admin</div>
            <div className="mt-1 text-slate-700">{s?.whatsappNumber}</div>

            <div className="mt-5 text-base font-semibold text-slate-700">Email</div>
            <div className="mt-1 text-slate-700">{s?.email}</div>

            <div className="mt-5 text-base font-semibold text-slate-700">Jam Layanan</div>
            <div className="mt-1 text-slate-700">{s?.serviceHours}</div>

            <div className="mt-5 text-base font-semibold text-slate-700">Sosial Media</div>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              {s?.socialTikTok && (
                <Link className="underline text-brand-700 hover:text-brand-600" href={s.socialTikTok} target="_blank">
                  TikTok
                </Link>
              )}
              {s?.socialFacebook && (
                <Link className="underline text-brand-700 hover:text-brand-600" href={s.socialFacebook} target="_blank">
                  Facebook
                </Link>
              )}
              {s?.instagramEnabled && s?.socialInstagram && (
                <Link className="underline text-brand-700 hover:text-brand-600" href={s.socialInstagram} target="_blank">
                  Instagram
                </Link>
              )}
            </div>

            <div className="mt-6">
              <WhatsAppCta waMe={waMe} text={s?.ctaText ?? "Hubungi via WhatsApp"} />
            </div>
          </div>

          <div>
            <div className="text-base font-semibold text-slate-700">Lokasi (Maps)</div>
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
              <div
                className="[&>iframe]:h-[360px] [&>iframe]:w-full"
                dangerouslySetInnerHTML={{ __html: s?.mapsEmbedIframe ?? "" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
