"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ToastState = {
  kind: "ok" | "err";
  message: string;
};

export default function AdminToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const ok = searchParams.get("ok");
    const err = searchParams.get("err");
    if (!ok && !err) return;

    setToast({
      kind: err ? "err" : "ok",
      message: err ?? ok ?? "",
    });

    const next = new URLSearchParams(searchParams.toString());
    next.delete("ok");
    next.delete("err");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (!toast) return null;

  const isError = toast.kind === "err";
  return (
    <div className="fixed right-4 top-4 z-[70] w-[min(92vw,420px)]">
      <div
        className={[
          "rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur",
          isError
            ? "border-rose-200 bg-rose-50 text-rose-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800",
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="font-medium">{toast.message}</div>
          <button
            type="button"
            className="rounded px-2 py-0.5 text-xs font-semibold hover:bg-black/5"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}
