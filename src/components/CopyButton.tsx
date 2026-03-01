"use client";
import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-brand-900 shadow hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      {copied ? "Tersalin ✅" : "Salin"}
    </button>
  );
}
