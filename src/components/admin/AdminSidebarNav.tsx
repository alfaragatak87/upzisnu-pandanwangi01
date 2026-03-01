"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
};

const contentItems: NavItem[] = [
  { label: "Pengaturan Website", href: "/admin/pengaturan" },
  { label: "Pengurus (Tree)", href: "/admin/pengurus" },
  { label: "Program", href: "/admin/program" },
  { label: "Berita", href: "/admin/berita" },
  { label: "Galeri", href: "/admin/galeri" },
  { label: "Laporan Bulanan", href: "/admin/laporan" },
];

const gkoinItems: NavItem[] = [
  { label: "Dusun", href: "/admin/gkoin/dusun" },
  { label: "Setoran Bulanan", href: "/admin/gkoin/setoran" },
  { label: "Rekap", href: "/admin/gkoin/rekap" },
];

function isPathActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isPathActive(pathname, item.href);
  return (
    <Link
      className={[
        "block rounded-md px-3 py-2 transition",
        active
          ? "bg-brand-50 font-semibold text-brand-900 ring-1 ring-brand-200"
          : "text-slate-700 hover:bg-slate-50",
      ].join(" ")}
      href={item.href}
      aria-current={active ? "page" : undefined}
    >
      {item.label}
    </Link>
  );
}

export default function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1 text-sm">
      <NavLink item={{ label: "Dashboard", href: "/admin" }} pathname={pathname} />
      <div className="mt-2 text-xs font-semibold text-slate-500">Konten</div>
      {contentItems.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}
      <div className="mt-2 text-xs font-semibold text-slate-500">G-Koin</div>
      {gkoinItems.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}
    </nav>
  );
}
