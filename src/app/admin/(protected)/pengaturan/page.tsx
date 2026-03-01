import { prisma } from "@/lib/prisma";

type AdminPengaturanPageProps = {
  searchParams?: {
    err?: string;
    field?: string;
  };
};

export default async function AdminPengaturanPage({ searchParams }: AdminPengaturanPageProps) {
  const s = await prisma.siteSetting.findFirst();
  if (!s) {
    return (
      <div>
        <h1 className="text-xl font-bold">Pengaturan Website</h1>
        <p className="mt-2 text-sm text-slate-600">SiteSetting belum ada. Jalankan seed dulu.</p>
      </div>
    );
  }

  const errorMessage = searchParams?.err;
  const errorField = searchParams?.field;
  const inputClass = (field: string) =>
    `mt-1 w-full rounded-md border px-3 py-2 ${errorField === field ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`;
  const textareaClass = (field: string) =>
    `mt-1 w-full rounded-md border px-3 py-2 ${errorField === field ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`;

  return (
    <div>
      <h1 className="text-xl font-bold">Pengaturan Website</h1>
      <p className="mt-2 text-sm text-slate-600">Semua identitas & kontak dikontrol dari sini.</p>

      <form className="mt-6 space-y-4" action={`/api/admin/settings/${s.id}`} method="post">
        {errorMessage && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Nama brand (tampilan)</label>
            <input name="brandNameDisplay" defaultValue={s.brandNameDisplay} className={inputClass("brandNameDisplay")} />
          </div>
          <div>
            <label className="text-sm font-semibold">Nama legal</label>
            <input name="legalName" defaultValue={s.legalName} className={inputClass("legalName")} />
          </div>
          <div>
            <label className="text-sm font-semibold">Berdiri sejak</label>
            <input name="foundedYear" type="number" defaultValue={s.foundedYear} className={inputClass("foundedYear")} />
          </div>
          <div>
            <label className="text-sm font-semibold">CTA Text</label>
            <input name="ctaText" defaultValue={s.ctaText} className={inputClass("ctaText")} />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Headline Beranda</label>
          <input name="homeHeadline" defaultValue={s.homeHeadline} className={inputClass("homeHeadline")} />
        </div>
        <div>
          <label className="text-sm font-semibold">Subheadline Beranda</label>
          <textarea name="homeSubheadline" defaultValue={s.homeSubheadline} className={textareaClass("homeSubheadline")} rows={3} />
        </div>

        <div>
          <label className="text-sm font-semibold">Alamat</label>
          <textarea name="address" defaultValue={s.address} className={textareaClass("address")} rows={3} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">WhatsApp Number</label>
            <input name="whatsappNumber" defaultValue={s.whatsappNumber} className={inputClass("whatsappNumber")} />
          </div>
          <div>
            <label className="text-sm font-semibold">WA.me (tanpa +)</label>
            <input name="whatsappWaMe" defaultValue={s.whatsappWaMe} className={inputClass("whatsappWaMe")} />
          </div>
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input name="email" defaultValue={s.email} className={inputClass("email")} />
          </div>
          <div>
            <label className="text-sm font-semibold">Jam layanan</label>
            <input name="serviceHours" defaultValue={s.serviceHours} className={inputClass("serviceHours")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">TikTok</label>
            <input name="socialTikTok" defaultValue={s.socialTikTok} className={inputClass("socialTikTok")} />
          </div>
          <div>
            <label className="text-sm font-semibold">Facebook</label>
            <input name="socialFacebook" defaultValue={s.socialFacebook} className={inputClass("socialFacebook")} />
          </div>
          <div>
            <label className="text-sm font-semibold">Instagram</label>
            <input name="socialInstagram" defaultValue={s.socialInstagram ?? ""} className={inputClass("socialInstagram")} />
            <label className="mt-2 inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="instagramEnabled" defaultChecked={s.instagramEnabled} />
              Tampilkan Instagram
            </label>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">Bank</label>
            <input name="donationBankName" defaultValue={s.donationBankName} className={inputClass("donationBankName")} />
          </div>
          <div>
            <label className="text-sm font-semibold">No Rek</label>
            <input name="donationAccountNumber" defaultValue={s.donationAccountNumber} className={inputClass("donationAccountNumber")} />
          </div>
          <div>
            <label className="text-sm font-semibold">A/N</label>
            <input name="donationAccountHolder" defaultValue={s.donationAccountHolder} className={inputClass("donationAccountHolder")} />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Maps iframe</label>
          <textarea
            name="mapsEmbedIframe"
            defaultValue={s.mapsEmbedIframe}
            className={`${textareaClass("mapsEmbedIframe")} font-mono text-xs`}
            rows={6}
          />
        </div>

        <button className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800" type="submit">
          Simpan Pengaturan
        </button>
      </form>
    </div>
  );
}
