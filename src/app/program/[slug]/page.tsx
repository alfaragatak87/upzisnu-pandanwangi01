import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { formatDateID } from "@/lib/date";

export default async function ProgramDetail({ params }: { params: { slug: string } }) {
  const [s, program] = await Promise.all([
    prisma.siteSetting.findFirst(),
    prisma.program.findUnique({ where: { slug: params.slug } }),
  ]);

  if (!program || !program.isActive) return notFound();

  const waMe = s?.whatsappWaMe ?? "6285134739466";
  const relatedPrograms = await prisma.program.findMany({
    where: { isActive: true, id: { not: program.id } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 4,
  });

  const paragraphs = program.description
    .split(/\n{2,}/)
    .map((x) => x.trim())
    .filter(Boolean);

  return (
    <div className="container-page py-12 md:py-14">
      <Link href="/program" className="text-sm font-medium text-brand-700 underline hover:text-brand-600">
        ← Kembali ke Program
      </Link>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          {program.category}
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{program.title}</h1>
        <div className="mt-2 text-sm text-slate-600">Diperbarui: {formatDateID(program.updatedAt)}</div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {program.imagePath && (
            <div className="relative mb-7 aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <Image
                src={program.imagePath.startsWith("/") ? program.imagePath : `/${program.imagePath}`}
                alt={program.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-slate max-w-none">
            {paragraphs.length > 0
              ? paragraphs.map((text, idx) => <p key={`${program.id}-${idx}`}>{text}</p>)
              : <p>{program.description}</p>}
          </div>
        </article>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <div className="text-sm font-semibold text-brand-900">Aksi Cepat</div>
            <p className="mt-2 text-sm text-brand-800">Tertarik mendukung program ini? Hubungi admin atau langsung donasi.</p>
            <div className="mt-4 space-y-2">
              <WhatsAppCta
                waMe={waMe}
                text="Tanya Program via WhatsApp"
                message={`Assalamu’alaikum. Saya ingin bertanya terkait program: ${program.title}.`}
                className="!w-full !rounded-lg !bg-emerald-500 !px-4 !py-2.5 !text-sm !font-semibold !text-white hover:!bg-emerald-400"
              />
              <Link
                href="/donasi"
                className="inline-flex w-full items-center justify-center rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
              >
                Donasi Sekarang
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-semibold text-slate-900">Program Lainnya</div>
            <div className="mt-3 space-y-2">
              {relatedPrograms.map((item) => (
                <Link key={item.id} href={`/program/${item.slug}`} className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {item.title}
                </Link>
              ))}
              {relatedPrograms.length === 0 && <div className="text-sm text-slate-600">Belum ada program lainnya.</div>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
