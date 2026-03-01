import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

type AdminLoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  const hasError = searchParams?.error === "1";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-page flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-bold">Login Admin</h1>
          <p className="mt-2 text-sm text-slate-600">Masuk untuk mengelola konten.</p>

          {hasError && (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Username atau password salah.
            </div>
          )}

          <form className="mt-6 space-y-4" action="/api/admin/login" method="post">
            <div>
              <label className="text-sm font-semibold">Username</label>
              <input
                name="username"
                autoComplete="username"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Password</label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                required
              />
            </div>
            <button className="w-full rounded-md bg-brand-900 px-4 py-2 font-semibold text-white hover:bg-brand-800" type="submit">
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
