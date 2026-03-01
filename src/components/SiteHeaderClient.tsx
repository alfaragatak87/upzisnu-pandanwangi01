"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { WhatsAppCta } from "@/components/WhatsAppCta";

type NavItem = {
  label: string;
  href: string;
};

export function SiteHeaderClient({
  brandName,
  foundedYear,
  waMe,
  cta,
  mainNav,
}: {
  brandName: string;
  foundedYear: number;
  waMe: string;
  cta: string;
  mainNav: NavItem[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-800/40 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 text-white">
      <div className="container-page flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-xl border border-white/20 bg-white/10 p-1.5">
            <Image src="/brand/logo-lazisnu.png" alt="Logo LAZISNU" width={44} height={44} priority />
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold sm:text-lg">{brandName}</div>
            <div className="text-[13px] text-white/80 sm:text-sm">LAZISNU • Berdiri sejak {foundedYear}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-white text-brand-900"
                  : "text-white/85 hover:bg-white/10 hover:text-white"
              }`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <WhatsAppCta
            waMe={waMe}
            text={cta}
            className="hidden lg:inline-flex !rounded-lg !bg-emerald-500 !px-4 !py-2.5 !text-sm !font-semibold !text-white !shadow-sm hover:!bg-emerald-400"
          />
          <Link
            href="/donasi"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isActive("/donasi")
                ? "bg-brand-100 text-brand-900"
                : "bg-white text-brand-900 hover:bg-brand-100"
            }`}
          >
            Donasi
          </Link>
          <Link
            className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
              isActive("/admin/login")
                ? "border-white bg-white text-brand-900"
                : "border-white/35 text-white/90 hover:bg-white/10 hover:text-white"
            }`}
            href="/admin/login"
          >
            Admin
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md border border-white/25 bg-white/10 p-2 text-white md:hidden"
        >
          <span className="relative block h-4 w-5">
            <span className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      <div className={`md:hidden ${open ? "block" : "hidden"}`}>
        <div className="container-page pb-3">
          <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 font-medium transition ${
                    isActive(item.href)
                      ? "bg-white text-brand-900"
                      : "border border-white/20 bg-white/10 text-white/95 hover:bg-white/20"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/donasi"
                className={`rounded-md px-3 py-2 text-center text-sm font-semibold transition ${
                  isActive("/donasi")
                    ? "bg-brand-100 text-brand-900"
                    : "bg-white text-brand-900 hover:bg-brand-100"
                }`}
              >
                Donasi
              </Link>
              <Link
                href="/admin/login"
                className={`rounded-md border px-3 py-2 text-center text-sm font-semibold transition ${
                  isActive("/admin/login")
                    ? "border-white bg-white text-brand-900"
                    : "border-white/35 text-white/95 hover:bg-white/10"
                }`}
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
