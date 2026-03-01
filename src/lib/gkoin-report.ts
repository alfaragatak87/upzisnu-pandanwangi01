import { prisma } from "@/lib/prisma";

export type GkoinMonthlyRow = {
  no: number;
  dusunId: string;
  dusunName: string;
  amount: number;
  depositorName: string;
  inputDate: Date | null;
  note: string;
  status: "Sudah" | "Belum";
};

export type GkoinMonthlyReportData = {
  scope: "monthly";
  month: number;
  year: number;
  totalDusun: number;
  sudahSetor: number;
  belumSetor: number;
  completion: number;
  totalNominal: number;
  rows: GkoinMonthlyRow[];
  generatedAt: Date;
};

export type GkoinYearlyMonthlySummary = {
  month: number;
  totalNominal: number;
  sudahSetor: number;
  belumSetor: number;
  completion: number;
};

export type GkoinYearlyMatrixRow = {
  no: number;
  dusunId: string;
  dusunName: string;
  monthlyAmounts: number[];
  total: number;
};

export type GkoinYearlyDetailRow = {
  no: number;
  month: number;
  year: number;
  inputDate: Date;
  dusunName: string;
  depositorName: string;
  amount: number;
  note: string;
};

export type GkoinYearlyReportData = {
  scope: "yearly";
  year: number;
  totalDusun: number;
  totalNominal: number;
  averageCompletion: number;
  monthlySummaries: GkoinYearlyMonthlySummary[];
  matrixRows: GkoinYearlyMatrixRow[];
  detailRows: GkoinYearlyDetailRow[];
  generatedAt: Date;
};

export function formatDateDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function monthShort(month: number): string {
  const labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return labels[month - 1] ?? String(month);
}

export function monthShortID(month: number): string {
  return monthShort(month);
}

export async function getGkoinMonthlyReportData(month: number, year: number): Promise<GkoinMonthlyReportData> {
  const [dusunList, deposits] = await Promise.all([
    prisma.gkoinDusun.findMany({ orderBy: { name: "asc" } }),
    prisma.gkoinDeposit.findMany({
      where: { month, year },
      include: { dusun: true },
      orderBy: [{ dusun: { name: "asc" } }, { inputDate: "asc" }],
    }),
  ]);

  const depositByDusunId = new Map(deposits.map((x) => [x.dusunId, x]));
  const rows: GkoinMonthlyRow[] = dusunList.map((dusun, idx) => {
    const found = depositByDusunId.get(dusun.id);
    if (!found) {
      return {
        no: idx + 1,
        dusunId: dusun.id,
        dusunName: dusun.name,
        amount: 0,
        depositorName: "-",
        inputDate: null,
        note: "",
        status: "Belum",
      };
    }
    return {
      no: idx + 1,
      dusunId: dusun.id,
      dusunName: dusun.name,
      amount: found.amount,
      depositorName: found.depositorName ?? "-",
      inputDate: found.inputDate,
      note: found.note ?? "",
      status: "Sudah",
    };
  });

  const totalDusun = dusunList.length;
  const sudahSetor = deposits.length;
  const belumSetor = Math.max(0, totalDusun - sudahSetor);
  const completion = totalDusun > 0 ? Math.round((sudahSetor / totalDusun) * 100) : 0;
  const totalNominal = deposits.reduce((sum, x) => sum + x.amount, 0);

  return {
    scope: "monthly",
    month,
    year,
    totalDusun,
    sudahSetor,
    belumSetor,
    completion,
    totalNominal,
    rows,
    generatedAt: new Date(),
  };
}

export async function getGkoinYearlyReportData(year: number): Promise<GkoinYearlyReportData> {
  const [dusunList, deposits] = await Promise.all([
    prisma.gkoinDusun.findMany({ orderBy: { name: "asc" } }),
    prisma.gkoinDeposit.findMany({
      where: { year },
      include: { dusun: true },
      orderBy: [{ month: "asc" }, { dusun: { name: "asc" } }, { inputDate: "asc" }],
    }),
  ]);

  const totalDusun = dusunList.length;

  const byMonth = new Map<number, typeof deposits>();
  for (let m = 1; m <= 12; m += 1) byMonth.set(m, []);
  for (const deposit of deposits) {
    const arr = byMonth.get(deposit.month);
    if (arr) arr.push(deposit);
  }

  const monthlySummaries: GkoinYearlyMonthlySummary[] = [];
  for (let month = 1; month <= 12; month += 1) {
    const monthDeposits = byMonth.get(month) ?? [];
    const sudahSetor = new Set(monthDeposits.map((x) => x.dusunId)).size;
    const belumSetor = Math.max(0, totalDusun - sudahSetor);
    const totalNominal = monthDeposits.reduce((sum, x) => sum + x.amount, 0);
    const completion = totalDusun > 0 ? Math.round((sudahSetor / totalDusun) * 100) : 0;
    monthlySummaries.push({ month, totalNominal, sudahSetor, belumSetor, completion });
  }

  const byDusun = new Map(
    dusunList.map((dusun) => [
      dusun.id,
      { dusunId: dusun.id, dusunName: dusun.name, monthlyAmounts: Array(12).fill(0) as number[], total: 0 },
    ]),
  );

  for (const deposit of deposits) {
    const row = byDusun.get(deposit.dusunId);
    if (!row) continue;
    row.monthlyAmounts[deposit.month - 1] += deposit.amount;
    row.total += deposit.amount;
  }

  const matrixRows: GkoinYearlyMatrixRow[] = Array.from(byDusun.values())
    .sort((a, b) => a.dusunName.localeCompare(b.dusunName))
    .map((x, idx) => ({ no: idx + 1, ...x }));

  const detailRows: GkoinYearlyDetailRow[] = deposits.map((x, idx) => ({
    no: idx + 1,
    month: x.month,
    year: x.year,
    inputDate: x.inputDate,
    dusunName: x.dusun.name,
    depositorName: x.depositorName ?? "-",
    amount: x.amount,
    note: x.note ?? "",
  }));

  const totalNominal = deposits.reduce((sum, x) => sum + x.amount, 0);
  const averageCompletion =
    monthlySummaries.length > 0
      ? Math.round(monthlySummaries.reduce((sum, x) => sum + x.completion, 0) / monthlySummaries.length)
      : 0;

  return {
    scope: "yearly",
    year,
    totalDusun,
    totalNominal,
    averageCompletion,
    monthlySummaries,
    matrixRows,
    detailRows,
    generatedAt: new Date(),
  };
}
