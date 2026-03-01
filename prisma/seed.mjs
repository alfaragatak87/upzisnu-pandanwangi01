import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  // Admin seed
  const username = "alfatih";
  const plainPassword = "050105";
  const existingAdmin = await prisma.adminUser.findUnique({ where: { username } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    await prisma.adminUser.create({ data: { username, passwordHash } });
    console.log("Seeded admin user:", username);
  }

  // SiteSetting seed
  const existingSetting = await prisma.siteSetting.findFirst();
  if (!existingSetting) {
    await prisma.siteSetting.create({
      data: {
        brandNameDisplay: "UPZISNU Pandanwangi 01",
        legalName: "UPZISNU RANTING PANDANWANGI 01",
        foundedYear: 2025,
        address:
          "Jl. Wachid Hasyim, RT 02/RW 03, Dusun Krajan 2, Desa Pandanwangi, Kecamatan Tempeh, Kabupaten Lumajang, Jawa Timur 67371",
        whatsappNumber: "085134739466",
        whatsappWaMe: "6285134739466",
        email: "lazisn393@gmail.com",
        serviceHours: "Senin–Sabtu, 08.00–16.00",
        socialTikTok:
          "https://www.tiktok.com/@lazisnupandanwangi1?_r=1&_t=ZS-94IVEGk4Dw7",
        socialFacebook: "https://www.facebook.com/lazis.nu.2025",
        socialInstagram: "https://www.instagram.com/lazis_nu_pandanwangi01/",
        instagramEnabled: true,
        donationBankName: "Bank Jatim",
        donationAccountNumber: "7432000131",
        donationAccountHolder: "UPZISNU RANTING PANDANWANGI 01",
        homeHeadline: "Amanah Menyalurkan Zakat, Infak, dan Sedekah",
        homeSubheadline:
          "Mewujudkan kepedulian bersama melalui penyaluran yang tepat sasaran, transparan, dan terdokumentasi.",
        ctaText: "Hubungi via WhatsApp",
        mapsEmbedIframe:
          '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d514.198606035385!2d113.19348415954799!3d-8.237216855420543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd6658a5d5d9cc3%3A0xb2fa614f7bd26db!2sMasjid%20Al%20Amin%20Pandanwangi!5e0!3m2!1sid!2sid!4v1772285953919!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
        legalDocPdfPath: "/seed/legal/surat-keterangan-sk.pdf",
      },
    });
    console.log("Seeded site settings");
  }

  // Album seed
  let album = await prisma.galleryAlbum.findFirst({ where: { title: "Dokumentasi Kegiatan" } });
  if (!album) {
    album = await prisma.galleryAlbum.create({ data: { title: "Dokumentasi Kegiatan" } });
    console.log("Created default album");
  }

  // Gallery seed (only if empty)
  const existingPhotoCount = await prisma.galleryPhoto.count({ where: { albumId: album.id } });
  if (existingPhotoCount === 0) {
    const seedPhotos = [
      { imagePath: "/seed/gallery/santunan-duka-cita.jpg", caption: "Santunan duka cita sebagai bentuk kepedulian kepada warga yang sedang berduka." },
      { imagePath: "/seed/gallery/santunan-yatim.jpg", caption: "Kegiatan santunan anak yatim untuk menghadirkan kebahagiaan dan dukungan." },
      { imagePath: "/seed/gallery/sembako.jpg", caption: "Penyaluran paket sembako untuk dhuafa sebagai amanah donatur." },
    ];
    for (let i = 0; i < seedPhotos.length; i++) {
      await prisma.galleryPhoto.create({ data: { albumId: album.id, ...seedPhotos[i], sortOrder: i } });
    }
    console.log("Seeded gallery photos");
  }

  // Programs seed
  const programs = [
    {
      title: "Santunan Anak Yatim",
      category: "Sosial",
      description:
        "Program bantuan untuk anak yatim berupa santunan dan dukungan kebutuhan dasar, sebagai bentuk kepedulian dan ikhtiar bersama.",
    },
    {
      title: "Sembako untuk Dhuafa",
      category: "Sosial",
      description:
        "Penyaluran paket sembako bagi fakir miskin dan dhuafa untuk meringankan beban kebutuhan harian.",
    },
    {
      title: "Santunan Duka Cita",
      category: "Sosial",
      description:
        "Santunan duka cita untuk warga yang berduka sebagai penguatan solidaritas dan kepedulian sosial.",
    },
    {
      title: "G-Koin (Program Bantuan)",
      category: "Pemberdayaan",
      description:
        "G-Koin adalah program bantuan yang dihimpun dari masyarakat lalu digunakan untuk membantu warga dan kegiatan sosial secara terencana dan terukur.",
    },
  ];
  for (const p of programs) {
    const slug = slugify(p.title);
    const exists = await prisma.program.findUnique({ where: { slug } });
    if (!exists) await prisma.program.create({ data: { ...p, slug, isActive: true } });
  }

  // News seed
  const newsItems = [
    {
      title: "Santunan Duka Cita untuk Warga Pandanwangi",
      coverImagePath: "/seed/news/berita-santunan-duka-cita.jpg",
      contentMarkdown:
        "UPZISNU Pandanwangi 01 menyalurkan **santunan duka cita** sebagai bentuk kepedulian dan solidaritas kepada keluarga yang sedang berduka.\n\nSemoga bantuan ini menjadi penguat, serta menjadi amal jariyah bagi para donatur. Terima kasih atas kepercayaan dan dukungan panjenengan semua.\n\n> Ingin konfirmasi donasi? Silakan hubungi admin melalui WhatsApp.",
      isPublished: true,
    },
    {
      title: "Santunan Anak Yatim – Kepedulian untuk Masa Depan",
      coverImagePath: "/seed/news/berita-santunan-yatim.jpg",
      contentMarkdown:
        "Kegiatan **santunan anak yatim** merupakan ikhtiar bersama untuk meringankan kebutuhan dan menghadirkan kebahagiaan.\n\nUPZISNU Pandanwangi 01 berkomitmen menyalurkan amanah donatur secara tepat sasaran dan terdokumentasi.",
      isPublished: true,
    },
    {
      title: "Penyaluran Sembako untuk Dhuafa",
      coverImagePath: "/seed/news/berita-sembako.jpg",
      contentMarkdown:
        "Penyaluran paket sembako untuk dhuafa sebagai wujud amanah donatur dan kepedulian sosial di lingkungan Pandanwangi.\n\nSetiap penyaluran akan kami dokumentasikan dan laporkan secara berkala.",
      isPublished: true,
    },
  ];
  for (const n of newsItems) {
    const slug = slugify(n.title);
    const exists = await prisma.news.findUnique({ where: { slug } });
    if (!exists) {
      await prisma.news.create({
        data: {
          title: n.title,
          slug,
          coverImagePath: n.coverImagePath,
          contentMarkdown: n.contentMarkdown,
          isPublished: n.isPublished,
          publishedAt: n.isPublished ? new Date() : null,
        },
      });
    }
  }

  // Org seed (ketua as parent)
  const ketua = await prisma.organizationMember.findFirst({ where: { positionTitle: "Ketua" } });
  let ketuaId = ketua?.id;
  if (!ketuaId) {
    const created = await prisma.organizationMember.create({ data: { positionTitle: "Ketua", name: "Edy Hartono", sortOrder: 0 } });
    ketuaId = created.id;
  }

  const members = [
    { positionTitle: "Dewan Syariah", name: "Imam Sibawe, S.Ag" },
    { positionTitle: "Dewan Syariah", name: "M. Ainur Rofiq, S.Pd" },
    { positionTitle: "Dewan Pengawas", name: "Sugeng Waluyo" },
    { positionTitle: "Dewan Pengawas", name: "Agus Subali" },
    { positionTitle: "Sekretaris", name: "Zainul Amin, S.Pd", parent: true },
    { positionTitle: "Bendahara", name: "Anang Wibisono", parent: true },
    { positionTitle: "Bid. Penghimpunan & Distribusi", name: "Muhammad Ali", parent: true },
    { positionTitle: "Bid. Penghimpunan & Distribusi", name: "Sugi", parent: true },
    { positionTitle: "Bid. Penghimpunan & Distribusi", name: "Bambang", parent: true },
    { positionTitle: "Bid. Penghimpunan & Distribusi", name: "Amiri", parent: true },
    { positionTitle: "Bid. Penghimpunan & Distribusi", name: "Canda", parent: true },
    { positionTitle: "Bid. Penghimpunan & Distribusi", name: "Daruji", parent: true },
    { positionTitle: "Bid. Humas", name: "M. Kemal", parent: true },
    { positionTitle: "Bid. Pendayagunaan & Usaha", name: "Reza", parent: true },
    { positionTitle: "Bid. Pendayagunaan & Usaha", name: "Anton", parent: true },
    { positionTitle: "Bid. Pendidikan & Kesehatan", name: "Ibnu Hajar", parent: true },
    { positionTitle: "Bid. Pendidikan & Kesehatan", name: "Moh. Agus Wahyudi", parent: true },
    { positionTitle: "Bid. Sosial & Budaya", name: "M. Aqil Safaat", parent: true },
    { positionTitle: "Bid. Sosial & Budaya", name: "M. Miski", parent: true },
    { positionTitle: "Bid. Sosial & Budaya", name: "Suhan", parent: true },
  ];

  for (const m of members) {
    const exists = await prisma.organizationMember.findFirst({ where: { positionTitle: m.positionTitle, name: m.name } });
    if (!exists) {
      await prisma.organizationMember.create({ data: { positionTitle: m.positionTitle, name: m.name, parentId: m.parent ? ketuaId : null } });
    }
  }

  // G-Koin dusun seed
  const dusunList = [
    "Dusun Krajan 1",
    "Dusun Krajan 2",
    "Dusun Krajan 3",
    "Dusun Timur Sawah",
    "Dusun Pemukiman",
    "Dusun Tunjungan",
  ];
  for (const name of dusunList) {
    const exists = await prisma.gkoinDusun.findUnique({ where: { name } });
    if (!exists) await prisma.gkoinDusun.create({ data: { name } });
  }

  // Laporan seed (contoh)
  const reports = [
    { month: 1, year: 2026, incomePdfPath: "/seed/reports/laporan_januari_2026.pdf", expensePdfPath: "/seed/reports/laporan_januari_2026.pdf", notes: "Contoh (MVP offline)" },
    { month: 2, year: 2026, incomePdfPath: "/seed/reports/laporan_februari_2026.pdf", expensePdfPath: "/seed/reports/laporan_februari_2026.pdf", notes: "Contoh (MVP offline)" },
  ];
  for (const r of reports) {
    const exists = await prisma.monthlyReport.findFirst({ where: { month: r.month, year: r.year } });
    if (!exists) await prisma.monthlyReport.create({ data: r });
  }

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
