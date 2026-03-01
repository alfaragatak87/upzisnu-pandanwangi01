import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminToast from "@/components/admin/AdminToast";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminToast />
      <div className="border-b bg-white">
        <div className="container-page flex items-center justify-between py-4">
          <div className="font-bold">Admin — UPZISNU Pandanwangi 01</div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">Login: {session.username}</span>
            <form action="/api/admin/logout" method="post">
              <button className="rounded-md border border-slate-200 bg-white px-3 py-2 font-semibold hover:bg-slate-50" type="submit">
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-6 py-6 md:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          <AdminSidebarNav />

          <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-800">Aksi Cepat</div>
            <div className="mt-2 grid gap-2 text-sm">
              <Link className="rounded-md bg-brand-900 px-3 py-2 text-center font-semibold text-white hover:bg-brand-800" href="/admin/gkoin/setoran">
                Input Setoran G-Koin
              </Link>
              <Link className="rounded-md border border-brand-300 bg-white px-3 py-2 text-center font-semibold text-brand-900 hover:bg-brand-100" href="/admin/berita/new">
                Tulis Berita Baru
              </Link>
            </div>
          </div>
        </aside>

        <section className="rounded-xl border border-slate-200 bg-white p-6">{children}</section>
      </div>
    </div>
  );
}
