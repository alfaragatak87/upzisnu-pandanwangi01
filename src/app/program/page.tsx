import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Program | UPZISNU Pandanwangi 01" };

export default async function ProgramPage() {
  const programs = await prisma.program.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  const totalCategory = new Set(programs.map((p) => p.category)).size;

  return (
    <div className="container-page py-12 md:py-14">
      <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-brand-100 p-7 shadow-sm">
        <div className="max-w-3xl">
          <div className="text-sm font-semibold uppercase tracking-wide text-brand-700">Program Prioritas</div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Program Bantuan & Kegiatan</h1>
          <p className="mt-3 text-base text-slate-700 sm:text-lg">
            Daftar program UPZISNU Pandanwangi 01 untuk mendorong pemberdayaan, kepedulian sosial, dan penyaluran amanah yang tepat sasaran.
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Program</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{programs.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kategori Aktif</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{totalCategory}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</div>
            <div className="mt-1 text-lg font-bold text-emerald-700">Publikasi Aktif</div>
          </div>
        </div>
      </div>

      <div className="mt-9 grid gap-6 md:grid-cols-2">
        {programs.map((p, index) => (
          <Link
            key={p.id}
            href={`/program/${p.slug}`}
            className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg active:scale-[0.99] motion-safe:animate-[upzisnu-card-in_480ms_ease-out_both]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="relative h-40 w-full overflow-hidden border-b border-slate-200 bg-slate-100">
              {p.imagePath ? (
                <Image
                  src={p.imagePath.startsWith("/") ? p.imagePath : `/${p.imagePath}`}
                  alt={p.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-900">
                  <span className="text-sm font-semibold">Program UPZISNU</span>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-800">
                  {p.category}
                </span>
                <span className="text-xs font-medium text-slate-400 transition-colors group-hover:text-brand-700">Lihat detail</span>
              </div>

              <div className="mt-4 text-xl font-bold text-slate-900 transition-colors group-hover:text-brand-900">{p.title}</div>
              <div className="mt-3 overflow-hidden text-sm leading-relaxed text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                {p.description}
              </div>

              <div className="mt-5 h-1 w-14 rounded-full bg-brand-200 transition-all duration-200 group-hover:w-24 group-hover:bg-brand-500" />
            </div>
          </Link>
        ))}
        {programs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600">
            Belum ada program aktif saat ini.
          </div>
        )}
      </div>
    </div>
  );
}
