import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrgTree } from "@/components/OrgTree";

export const metadata = { title: "Tentang | UPZISNU Pandanwangi 01" };

export default async function TentangPage() {
  const s = await prisma.siteSetting.findFirst();
  const pengurus = await prisma.organizationMember.findMany({ where: { isActive: true } });

  return (
    <div className="container-page py-12 md:py-14">
      <section className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-brand-100 p-7 shadow-sm">
        <div className="max-w-4xl">
          <div className="text-sm font-semibold uppercase tracking-wide text-brand-700">Tentang Lembaga</div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">LAZISNU Pandanwangi 01</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            Kami adalah lembaga amil zakat yang mengelola penghimpunan dan penyaluran zakat, infak, serta sedekah secara amanah,
            transparan, dan berdampak langsung bagi kemaslahatan umat.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/program" className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
            Lihat Program
          </Link>
          <Link href="/laporan" className="rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-100">
            Lihat Laporan
          </Link>
          {s?.legalDocPdfPath && (
            <Link
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              href={s.legalDocPdfPath}
              target="_blank"
            >
              Download SK (PDF)
            </Link>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Misi</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-slate-700 sm:text-base">
            <li>Menghimpun zakat, infak, dan sedekah masyarakat secara terstruktur dan amanah.</li>
            <li>Menyalurkan dana kepada mustahik dan program sosial yang tepat sasaran.</li>
            <li>Mendorong peningkatan kesejahteraan umat melalui program berkelanjutan.</li>
          </ul>

          <h2 className="mt-7 text-xl font-bold text-slate-900">Nilai Utama</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Amanah", desc: "Menjaga kepercayaan donatur dan masyarakat." },
              { title: "Transparan", desc: "Pelaporan berkala dan dokumentasi terbuka." },
              { title: "Profesional", desc: "Pengelolaan program secara tertib dan terukur." },
              { title: "Kolaboratif", desc: "Bersinergi dengan warga dan tokoh setempat." },
              { title: "Tepat Sasaran", desc: "Penyaluran berdasar kebutuhan nyata lapangan." },
              { title: "Berkelanjutan", desc: "Program tidak berhenti pada penyaluran sesaat." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                <div className="mt-1 text-xs text-slate-600">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Legalitas</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Dokumen legalitas lembaga tersedia untuk diakses publik sebagai bagian dari komitmen keterbukaan.
          </p>

          {s?.legalDocPdfPath ? (
            <div className="mt-5">
              <Link
                className="inline-flex rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                href={s.legalDocPdfPath}
                target="_blank"
              >
                Download SK (PDF)
              </Link>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">Belum ada dokumen legalitas.</div>
          )}

          <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-4">
            <div className="text-sm font-semibold text-brand-900">Ringkasan Data</div>
            <div className="mt-3 grid gap-3 text-sm text-slate-700">
              <div className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                <span>Jumlah Pengurus Aktif</span>
                <span className="font-bold text-slate-900">{pengurus.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                <span>Brand Resmi</span>
                <span className="font-bold text-slate-900">{s?.brandNameDisplay ?? "UPZISNU Pandanwangi 01"}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                <span>Tahun Berdiri</span>
                <span className="font-bold text-slate-900">{s?.foundedYear ?? "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Struktur Pengurus</h2>
            <p className="mt-2 text-sm text-slate-600">Bagan organisasi ditampilkan berjenjang agar alur koordinasi lebih mudah dipahami.</p>
          </div>
          <Link href="/kontak" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Hubungi Pengurus
          </Link>
        </div>

        <div className="mt-6">
          <OrgTree
            items={pengurus.map((p) => ({
              id: p.id,
              positionTitle: p.positionTitle,
              name: p.name,
              photoPath: p.photoPath,
              whatsapp: p.whatsapp,
              parentId: p.parentId,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
