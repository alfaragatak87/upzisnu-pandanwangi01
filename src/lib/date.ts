export function formatDateID(d: Date): string {
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "2-digit" });
}

export function monthNameID(month: number): string {
  const d = new Date(2000, month - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "long" });
}
