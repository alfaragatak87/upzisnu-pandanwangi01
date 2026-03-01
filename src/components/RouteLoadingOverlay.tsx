"use client";

import { useEffect, useState } from "react";

export function RouteLoadingOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 280);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
      <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-white/30">
        <div className="h-full w-1/3 animate-[upzisnu-load_1.1s_ease-in-out_infinite] bg-brand-700" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-700 [animation-delay:-0.22s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-700 [animation-delay:-0.11s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-700" />
            <span className="text-sm font-semibold text-slate-700">Memuat halaman...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
