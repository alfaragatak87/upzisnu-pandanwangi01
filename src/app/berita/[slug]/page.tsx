import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateID } from "@/lib/date";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function BeritaDetail({ params }: { params: { slug: string } }) {
  const n = await prisma.news.findUnique({ where: { slug: params.slug } });
  if (!n || !n.isPublished) return notFound();

  const relatedNews = await prisma.news.findMany({
    where: { isPublished: true, id: { not: n.id } },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });

  return (
    <div className="container-page py-12 md:py-14">
      <Link href="/berita" className="text-sm font-medium text-brand-700 underline hover:text-brand-600">
        ← Kembali ke Berita
      </Link>

      <article className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">Berita</div>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{n.title}</h1>
        <div className="mt-2 text-sm text-slate-600">Dipublikasikan: {n.publishedAt ? formatDateID(n.publishedAt) : "Belum dijadwalkan"}</div>

        {n.coverImagePath && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            <Image
              src={n.coverImagePath.startsWith("/") ? n.coverImagePath : `/${n.coverImagePath}`}
              alt={n.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-brand-700 hover:prose-a:text-brand-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{n.contentMarkdown}</ReactMarkdown>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <div className="text-sm font-semibold text-brand-900">Dukung Kegiatan Kami</div>
              <p className="mt-2 text-sm text-brand-800">Setiap donasi Anda membantu keberlanjutan program dan kegiatan sosial.</p>
              <Link
                href="/donasi"
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
              >
                Donasi Sekarang
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Berita Terkait</div>
              <div className="mt-3 space-y-2">
                {relatedNews.map((item) => (
                  <Link key={item.id} href={`/berita/${item.slug}`} className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <div className="overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{item.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.publishedAt ? formatDateID(item.publishedAt) : "Draft"}</div>
                  </Link>
                ))}
                {relatedNews.length === 0 && <div className="text-sm text-slate-600">Belum ada berita terkait.</div>}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
