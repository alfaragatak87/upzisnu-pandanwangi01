import { prisma } from "@/lib/prisma";
import { SiteHeaderClient } from "@/components/SiteHeaderClient";

export async function SiteHeader() {
  const s = await prisma.siteSetting.findFirst();
  const waMe = s?.whatsappWaMe ?? "6285134739466";
  const cta = s?.ctaText ?? "Hubungi via WhatsApp";
  const mainNav = [
    { label: "Beranda", href: "/" },
    { label: "Program", href: "/program" },
    { label: "Berita", href: "/berita" },
    { label: "Galeri", href: "/galeri" },
    { label: "Laporan", href: "/laporan" },
    { label: "Tentang", href: "/tentang" },
    { label: "Kontak", href: "/kontak" },
  ];

  return (
    <SiteHeaderClient
      brandName={s?.brandNameDisplay ?? "UPZISNU Pandanwangi 01"}
      foundedYear={s?.foundedYear ?? 2025}
      waMe={waMe}
      cta={cta}
      mainNav={mainNav}
    />
  );
}
