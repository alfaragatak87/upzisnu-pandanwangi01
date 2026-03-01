import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDateID } from "@/lib/date";

export const metadata = { title: "Berita | UPZISNU Pandanwangi 01" };

export default async function BeritaPage() {
  const news = await prisma.news.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" } });
  const featured = news[0];
  const list = news.slice(1);

  return (
    <div className="container-page py-12 md:py-14">
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="text-sm font-semibold uppercase tracking-wide text-brand-700">Publikasi Resmi</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Berita & Kegiatan</h1>
        <p className="mt-3 max-w-3xl text-base text-slate-700 sm:text-lg">
          Dokumentasi kegiatan, penyaluran amanah, serta informasi terbaru dari LAZISNU Pandanwangi 01.
        </p>
      </div>

      {featured ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Link
            href={`/berita/${featured.slug}`}
            className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg active:scale-[0.99] motion-safe:animate-[upzisnu-card-in_480ms_ease-out_both]"
          >
            <div className="relative h-64 w-full overflow-hidden bg-slate-100 sm:h-72">
              {featured.coverImagePath ? (
                <Image
                  src={featured.coverImagePath.startsWith("/") ? featured.coverImagePath : `/${featured.coverImagePath}`}
                  alt={featured.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-900">
                  <span className="text-sm font-semibold">Berita Utama</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">Featured</span>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {featured.publishedAt ? formatDateID(featured.publishedAt) : "Belum dijadwalkan"}
                </span>
              </div>
              <div className="mt-4 text-2xl font-bold text-slate-900 transition-colors group-hover:text-brand-900">{featured.title}</div>
              <div className="mt-4 text-sm font-semibold text-brand-800">Baca berita utama</div>
            </div>
          </Link>

          <div className="space-y-4">
            {list.map((n, index) => (
              <Link
                key={n.id}
                href={`/berita/${n.slug}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md active:scale-[0.99] motion-safe:animate-[upzisnu-card-in_480ms_ease-out_both]"
                style={{ animationDelay: `${80 + index * 70}ms` }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Berita</span>
                  <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
                    {n.publishedAt ? formatDateID(n.publishedAt) : "Belum dijadwalkan"}
                  </span>
                </div>

                <div className="mt-3 text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-900">{n.title}</div>
                <div className="mt-3 text-sm font-semibold text-brand-800">Baca selengkapnya</div>
              </Link>
            ))}
            {list.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600">
                Belum ada berita tambahan.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-9">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600">
            Belum ada berita yang dipublikasikan.
          </div>
        </div>
      )}
    </div>
  );
}
