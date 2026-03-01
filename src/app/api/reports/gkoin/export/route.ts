import { execFile } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { monthNameID } from "@/lib/date";
import {
  formatDateDDMMYYYY,
  getGkoinMonthlyReportData,
  getGkoinYearlyReportData,
  type GkoinMonthlyReportData,
  type GkoinYearlyReportData,
} from "@/lib/gkoin-report";

export const runtime = "nodejs";

type Scope = "monthly" | "yearly";
type Format = "pdf" | "xlsx";

const MONTHLY_TEMPLATE_PATH =
  process.env.GKOIN_TEMPLATE_BULANAN_PATH ?? "/mnt/c/Users/ss662/Downloads/TEMPLATE_LAPORAN_BULANAN.xlsx";
const YEARLY_TEMPLATE_PATH =
  process.env.GKOIN_TEMPLATE_TAHUNAN_PATH ?? "/mnt/c/Users/ss662/Downloads/TEMPLATE_LAPORAN_TAHUNAN.xlsx";

const MONTHLY_TEMPLATE_MAX_ROWS = 12;
const YEARLY_TEMPLATE_MAX_DUSUN = 6;

const execFileAsync = promisify(execFile);

function parseIntSafe(value: string | null, fallback: number): number {
  const n = Number(value);
  if (!Number.isInteger(n)) return fallback;
  return n;
}

function parseScope(value: string | null): Scope {
  return value === "yearly" ? "yearly" : "monthly";
}

function parseFormat(value: string | null): Format {
  return value === "xlsx" ? "xlsx" : "pdf";
}

function contentDisposition(filename: string): string {
  return `attachment; filename="${filename}"`;
}

function formatPrintDateTime(date: Date): string {
  const d = formatDateDDMMYYYY(date);
  const t = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
  return `${d} ${t}`;
}

function formatLongDateID(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  return `${dd} ${monthNameID(date.getMonth() + 1)} ${date.getFullYear()}`;
}

function monthShortID(month: number): string {
  const labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return labels[month - 1] ?? String(month);
}

async function loadTemplateWorkbook(templatePath: string): Promise<ExcelJS.Workbook> {
  try {
    await fs.access(templatePath);
  } catch {
    throw new Error(`TEMPLATE_NOT_FOUND:${templatePath}`);
  }
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  return workbook;
}

function clearMonthlyDetailRow(sheet: ExcelJS.Worksheet, rowNumber: number) {
  sheet.getCell(`A${rowNumber}`).value = null;
  sheet.getCell(`B${rowNumber}`).value = null;
  sheet.getCell(`D${rowNumber}`).value = null;
  sheet.getCell(`F${rowNumber}`).value = null;
  sheet.getCell(`G${rowNumber}`).value = null;
  sheet.getCell(`H${rowNumber}`).value = null;
}

function fillMonthlyTemplate(workbook: ExcelJS.Workbook, data: GkoinMonthlyReportData): ExcelJS.Workbook {
  const sheet = workbook.getWorksheet("Sheet1") ?? workbook.getWorksheet(1);
  if (!sheet) throw new Error("MONTHLY_TEMPLATE_INVALID");

  const periodLabel = `${monthNameID(data.month)} ${data.year}`;
  sheet.getCell("D3").value = periodLabel;
  sheet.getCell("A8").value = data.totalDusun;
  sheet.getCell("C8").value = data.sudahSetor;
  sheet.getCell("E8").value = data.belumSetor;
  sheet.getCell("G8").value = data.totalDusun > 0 ? data.sudahSetor / data.totalDusun : 0;

  const rows = data.rows.slice(0, MONTHLY_TEMPLATE_MAX_ROWS);
  for (let idx = 0; idx < MONTHLY_TEMPLATE_MAX_ROWS; idx += 1) {
    const rowNumber = 13 + idx;
    const row = rows[idx];
    if (!row) {
      clearMonthlyDetailRow(sheet, rowNumber);
      continue;
    }
    sheet.getCell(`A${rowNumber}`).value = idx + 1;
    sheet.getCell(`B${rowNumber}`).value = row.dusunName;
    sheet.getCell(`D${rowNumber}`).value = row.amount;
    sheet.getCell(`F${rowNumber}`).value = row.depositorName === "-" ? "-" : row.depositorName;
    sheet.getCell(`G${rowNumber}`).value = row.inputDate ? String(row.inputDate.getDate()).padStart(2, "0") : "-";
    sheet.getCell(`H${rowNumber}`).value = row.status;
  }

  sheet.getCell("D25").value = data.totalNominal;
  const hiddenRows = Math.max(0, data.rows.length - MONTHLY_TEMPLATE_MAX_ROWS);
  sheet.getCell("A29").value =
    hiddenRows > 0
      ? `• ${hiddenRows} data dusun lainnya diringkas agar tetap sesuai template 1 halaman.`
      : "• Semua data dusun masuk ke lembar ini.";
  sheet.getCell("A32").value = `Lumajang, ${formatDateDDMMYYYY(data.generatedAt)}`;
  const printedAt = formatPrintDateTime(data.generatedAt);
  sheet.getCell("A40").value = "Dokumen Internal ";
  sheet.getCell("D40").value = ` Dicetak: ${printedAt} `;
  sheet.getCell("F40").value = "Hal 1/1";

  return workbook;
}

function clearYearlyDusunRow(sheet: ExcelJS.Worksheet, rowNumber: number) {
  for (let col = 1; col <= 14; col += 1) {
    sheet.getCell(rowNumber, col).value = null;
  }
}

function fillYearlyTemplate(workbook: ExcelJS.Workbook, data: GkoinYearlyReportData): ExcelJS.Workbook {
  const summary = workbook.getWorksheet("Ringkasan Tahunan") ?? workbook.getWorksheet(1);
  const matrix = workbook.getWorksheet("Rekap Per Dusun") ?? workbook.getWorksheet(2);
  if (!summary || !matrix) throw new Error("YEARLY_TEMPLATE_INVALID");

  summary.getCell("B3").value = `Periode: Januari–Desember ${data.year}`;
  summary.getCell("A7").value = data.totalDusun;
  summary.getCell("B7").value = `${data.averageCompletion}%`;
  for (let month = 1; month <= 12; month += 1) {
    const rowNumber = 9 + month;
    const monthly = data.monthlySummaries[month - 1];
    summary.getCell(`A${rowNumber}`).value = monthShortID(month);
    summary.getCell(`B${rowNumber}`).value = monthly?.sudahSetor ?? 0;
    summary.getCell(`C${rowNumber}`).value = monthly?.belumSetor ?? 0;
    summary.getCell(`D${rowNumber}`).value = `${monthly?.completion ?? 0}%`;
    summary.getCell(`E${rowNumber}`).value = monthly?.totalNominal ?? 0;
  }

  const printedAt = formatPrintDateTime(data.generatedAt);
  summary.getCell("A23").value = `Dokumen Internal• Dicetak: ${printedAt} • Hal 1/2`;

  matrix.getCell("D2").value = `Rekap Per Dusun Januari - Desember — ${data.year}`;
  matrix.getCell("D3").value = `Rekap Per Dusun Januari - Desember — ${data.year}`;

  const dusunRows = data.matrixRows.slice(0, YEARLY_TEMPLATE_MAX_DUSUN);
  for (let idx = 0; idx < YEARLY_TEMPLATE_MAX_DUSUN; idx += 1) {
    const rowNumber = 5 + idx;
    const row = dusunRows[idx];
    if (!row) {
      clearYearlyDusunRow(matrix, rowNumber);
      continue;
    }
    matrix.getCell(`A${rowNumber}`).value = idx + 1;
    matrix.getCell(`B${rowNumber}`).value = row.dusunName;
    for (let month = 0; month < 12; month += 1) {
      matrix.getCell(rowNumber, 3 + month).value = row.monthlyAmounts[month] ?? 0;
    }
  }

  const hiddenDusun = Math.max(0, data.matrixRows.length - YEARLY_TEMPLATE_MAX_DUSUN);
  matrix.getCell("A14").value = `- Rekap tahunan ini merupakan akumulasi data setoran bulanan G-KOIN tahun ${data.year}.`;
  matrix.getCell("A15").value =
    hiddenDusun > 0
      ? `- ${hiddenDusun} dusun tidak dimasukkan karena template dibatasi maksimal ${YEARLY_TEMPLATE_MAX_DUSUN} dusun.`
      : "- Nominal disajikan dalam Rupiah dan sudah termasuk pembulatan tampilan.";
  matrix.getCell("A17").value = `Lumajang, ${formatLongDateID(data.generatedAt)}`;
  matrix.getCell("A25").value = `Dokumen Internal • Dicetak: ${printedAt} • Hal 2/2`;

  return workbook;
}

async function resolveSofficeBinary(): Promise<string | null> {
  const envCandidate = process.env.SOFFICE_PATH?.trim();
  const candidates = [envCandidate, "/usr/bin/soffice", "/usr/bin/libreoffice", "soffice", "libreoffice"].filter(
    (x): x is string => Boolean(x),
  );

  for (const candidate of candidates) {
    try {
      if (candidate.includes("/")) {
        await fs.access(candidate);
      } else {
        await execFileAsync(candidate, ["--version"], { timeout: 5000, windowsHide: true });
      }
      return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

async function convertWorkbookToPdf(workbook: ExcelJS.Workbook, filenameStem: string): Promise<Buffer> {
  const soffice = await resolveSofficeBinary();
  if (!soffice) throw new Error("SOFFICE_NOT_FOUND");

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "gkoin-template-"));
  const xlsxPath = path.join(tempDir, `${filenameStem}.xlsx`);
  const pdfPath = path.join(tempDir, `${filenameStem}.pdf`);

  try {
    await workbook.xlsx.writeFile(xlsxPath);
    await execFileAsync(
      soffice,
      [
        "--headless",
        "--nologo",
        "--nodefault",
        "--nofirststartwizard",
        "--nolockcheck",
        "--norestore",
        "--convert-to",
        "pdf:calc_pdf_Export",
        "--outdir",
        tempDir,
        xlsxPath,
      ],
      {
        timeout: 180000,
        maxBuffer: 16 * 1024 * 1024,
        windowsHide: true,
      },
    );
    const pdfBuffer = await fs.readFile(pdfPath);
    return Buffer.from(pdfBuffer);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function workbookToBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  const bytes = await workbook.xlsx.writeBuffer();
  return Buffer.from(bytes);
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Terjadi kesalahan tidak dikenal.";
}

export async function GET(req: Request) {
  const admin = await getSession();
  if (!admin) {
    return NextResponse.json({ error: "Unduh dokumen hanya untuk admin yang sudah login." }, { status: 401 });
  }

  const url = new URL(req.url);
  const scope = parseScope(url.searchParams.get("scope"));
  const format = parseFormat(url.searchParams.get("format"));
  const year = parseIntSafe(url.searchParams.get("year"), new Date().getFullYear());
  const month = parseIntSafe(url.searchParams.get("month"), new Date().getMonth() + 1);

  if (year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Parameter tahun tidak valid." }, { status: 400 });
  }
  if (scope === "monthly" && (month < 1 || month > 12)) {
    return NextResponse.json({ error: "Parameter bulan tidak valid." }, { status: 400 });
  }

  try {
    if (scope === "monthly") {
      const data = await getGkoinMonthlyReportData(month, year);
      const template = await loadTemplateWorkbook(MONTHLY_TEMPLATE_PATH);
      fillMonthlyTemplate(template, data);

      if (format === "xlsx") {
        const xlsxBuffer = await workbookToBuffer(template);
        return new NextResponse(xlsxBuffer, {
          headers: {
            "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "content-disposition": contentDisposition(`gkoin-rekap-bulanan-${year}-${String(month).padStart(2, "0")}.xlsx`),
          },
        });
      }

      const pdfBuffer = await convertWorkbookToPdf(template, `gkoin-rekap-bulanan-${year}-${String(month).padStart(2, "0")}`);
      return new NextResponse(pdfBuffer, {
        headers: {
          "content-type": "application/pdf",
          "content-disposition": contentDisposition(`gkoin-rekap-bulanan-${year}-${String(month).padStart(2, "0")}.pdf`),
        },
      });
    }

    const data = await getGkoinYearlyReportData(year);
    const template = await loadTemplateWorkbook(YEARLY_TEMPLATE_PATH);
    fillYearlyTemplate(template, data);

    if (format === "xlsx") {
      const xlsxBuffer = await workbookToBuffer(template);
      return new NextResponse(xlsxBuffer, {
        headers: {
          "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "content-disposition": contentDisposition(`gkoin-rekap-tahunan-${year}.xlsx`),
        },
      });
    }

    const pdfBuffer = await convertWorkbookToPdf(template, `gkoin-rekap-tahunan-${year}`);
    return new NextResponse(pdfBuffer, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": contentDisposition(`gkoin-rekap-tahunan-${year}.pdf`),
      },
    });
  } catch (err) {
    const message = toErrorMessage(err);

    if (message.startsWith("TEMPLATE_NOT_FOUND:")) {
      return NextResponse.json(
        { error: `Template tidak ditemukan: ${message.replace("TEMPLATE_NOT_FOUND:", "")}` },
        { status: 500 },
      );
    }
    if (message === "SOFFICE_NOT_FOUND") {
      return NextResponse.json(
        {
          error:
            "Konversi PDF template membutuhkan LibreOffice (soffice). Install LibreOffice di server atau set env SOFFICE_PATH.",
        },
        { status: 500 },
      );
    }
    if (message === "MONTHLY_TEMPLATE_INVALID" || message === "YEARLY_TEMPLATE_INVALID") {
      return NextResponse.json({ error: "Struktur template tidak sesuai. Pastikan file template asli tidak diubah." }, { status: 500 });
    }

    return NextResponse.json({ error: `Gagal membuat dokumen: ${message}` }, { status: 500 });
  }
}
