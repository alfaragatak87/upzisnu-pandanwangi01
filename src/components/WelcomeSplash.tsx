"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SEEN_KEY = "upzisnu_welcome_seen";

export function WelcomeSplash() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(SEEN_KEY);
    if (alreadySeen) return;

    sessionStorage.setItem(SEEN_KEY, "1");
    setVisible(true);

    const hideTimer = setTimeout(() => {
      setExiting(true);
    }, 1650);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 2100);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  function closeNow() {
    setExiting(true);
    setTimeout(() => setVisible(false), 220);
  }

  return (
    <div
      className={`fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 p-5 transition-opacity duration-500 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl border border-white/20 bg-white/95 p-8 text-center shadow-2xl transition-all duration-500 ${
          exiting ? "translate-y-3 scale-[0.98]" : "translate-y-0 scale-100"
        }`}
      >
        <button
          type="button"
          aria-label="Tutup popup selamat datang"
          onClick={closeNow}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-100"
        >
          X
        </button>
        <div className="mx-auto flex w-fit items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <Image src="/brand/logo-lazisnu.png" alt="Logo LAZISNU" width={70} height={70} priority />
        </div>
        <div className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">Selamat Datang</div>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Website LAZISNU Pandanwangi 01</h1>
        <p className="mt-2 text-sm text-slate-600">Amanah menyalurkan zakat, infak, dan sedekah untuk kemaslahatan umat.</p>
      </div>
    </div>
  );
}
