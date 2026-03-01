"use client";
import Image from "next/image";
import { useState } from "react";

export type PhotoItem = { id: string; imagePath: string; caption: string; takenAt: string };

function formatDateID(d: Date): string {
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "2-digit" });
}

export function GalleryLightbox({ items }: { items: PhotoItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = items.find((x) => x.id === openId) ?? null;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((p) => (
          <button key={p.id} className="group text-left" onClick={() => setOpenId(p.id)} type="button">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <Image src={p.imagePath} alt={p.caption} fill className="object-cover transition-transform group-hover:scale-[1.02]" />
            </div>
            <div className="mt-2 text-sm font-semibold">{p.caption}</div>
            <div className="text-xs text-slate-600">{formatDateID(new Date(p.takenAt))}</div>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={() => setOpenId(null)}>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-lg bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{active.caption}</div>
                  <div className="text-xs text-slate-600">{formatDateID(new Date(active.takenAt))}</div>
                </div>
                <button className="rounded-md border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50" onClick={() => setOpenId(null)} type="button">
                  Tutup
                </button>
              </div>
              <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-md bg-slate-100">
                <Image src={active.imagePath} alt={active.caption} fill className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
