import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  AdminValidationError,
  assertEmail,
  assertHttpUrl,
  readBoolean,
  readInt,
  readNullableString,
  readString,
} from "@/lib/admin-form";
import { redirectWithFeedback } from "@/lib/admin-feedback";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return redirectWithFeedback(req, "/admin/login", { err: "Sesi admin berakhir. Silakan login ulang." });

  try {
    const form = await req.formData();
    const currentYear = new Date().getFullYear() + 1;

    const brandNameDisplay = readString(form, "brandNameDisplay", {
      label: "Nama brand",
      field: "brandNameDisplay",
      required: true,
      maxLength: 120,
    });
    const legalName = readString(form, "legalName", {
      label: "Nama legal",
      field: "legalName",
      required: true,
      maxLength: 180,
    });
    const foundedYear = readInt(form, "foundedYear", {
      label: "Tahun berdiri",
      field: "foundedYear",
      required: true,
      min: 1900,
      max: currentYear,
    });
    const ctaText = readString(form, "ctaText", { label: "CTA text", field: "ctaText", required: true, maxLength: 120 });
    const homeHeadline = readString(form, "homeHeadline", {
      label: "Headline beranda",
      field: "homeHeadline",
      required: true,
      maxLength: 180,
    });
    const homeSubheadline = readString(form, "homeSubheadline", {
      label: "Subheadline beranda",
      field: "homeSubheadline",
      required: true,
      maxLength: 1000,
    });
    const address = readString(form, "address", { label: "Alamat", field: "address", required: true, maxLength: 1000 });
    const whatsappNumber = readString(form, "whatsappNumber", {
      label: "Nomor WhatsApp",
      field: "whatsappNumber",
      required: true,
      maxLength: 40,
    });
    const whatsappWaMe = readString(form, "whatsappWaMe", {
      label: "WA.me",
      field: "whatsappWaMe",
      required: true,
      maxLength: 40,
    });
    if (!/^[0-9]{8,20}$/.test(whatsappWaMe)) {
      throw new AdminValidationError("Format WA.me harus angka tanpa simbol (+, -, spasi).", "whatsappWaMe");
    }

    const email = readString(form, "email", { label: "Email", field: "email", required: true, maxLength: 120 });
    assertEmail(email, "email");

    const serviceHours = readString(form, "serviceHours", {
      label: "Jam layanan",
      field: "serviceHours",
      required: true,
      maxLength: 120,
    });
    const socialTikTok = readString(form, "socialTikTok", {
      label: "URL TikTok",
      field: "socialTikTok",
      required: true,
      maxLength: 300,
    });
    const socialFacebook = readString(form, "socialFacebook", {
      label: "URL Facebook",
      field: "socialFacebook",
      required: true,
      maxLength: 300,
    });
    const socialInstagram = readNullableString(form, "socialInstagram", {
      label: "URL Instagram",
      field: "socialInstagram",
      maxLength: 300,
    });
    assertHttpUrl(socialTikTok, "URL TikTok", "socialTikTok");
    assertHttpUrl(socialFacebook, "URL Facebook", "socialFacebook");
    assertHttpUrl(socialInstagram, "URL Instagram", "socialInstagram");

    const instagramEnabled = readBoolean(form, "instagramEnabled");
    const donationBankName = readString(form, "donationBankName", {
      label: "Nama bank",
      field: "donationBankName",
      required: true,
      maxLength: 120,
    });
    const donationAccountNumber = readString(form, "donationAccountNumber", {
      label: "Nomor rekening",
      field: "donationAccountNumber",
      required: true,
      maxLength: 80,
    });
    const donationAccountHolder = readString(form, "donationAccountHolder", {
      label: "Atas nama rekening",
      field: "donationAccountHolder",
      required: true,
      maxLength: 180,
    });
    const mapsEmbedIframe = readString(form, "mapsEmbedIframe", {
      label: "Maps iframe",
      field: "mapsEmbedIframe",
      required: true,
      maxLength: 8000,
    });

    await prisma.siteSetting.update({
      where: { id: params.id },
      data: {
        brandNameDisplay,
        legalName,
        foundedYear,
        ctaText,
        homeHeadline,
        homeSubheadline,
        address,
        whatsappNumber,
        whatsappWaMe,
        email,
        serviceHours,
        socialTikTok,
        socialFacebook,
        socialInstagram,
        instagramEnabled,
        donationBankName,
        donationAccountNumber,
        donationAccountHolder,
        mapsEmbedIframe,
      },
    });

    return redirectWithFeedback(req, "/admin/pengaturan", { ok: "Pengaturan website berhasil diperbarui." });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      return redirectWithFeedback(req, "/admin/pengaturan", {
        err: error.message,
        query: { field: error.field },
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return redirectWithFeedback(req, "/admin/pengaturan", { err: "Data pengaturan tidak ditemukan." });
    }
    return redirectWithFeedback(req, "/admin/pengaturan", { err: "Gagal menyimpan pengaturan website." });
  }
}
