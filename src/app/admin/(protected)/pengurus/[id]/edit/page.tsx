import { prisma } from "@/lib/prisma";

// Admin edit page for organization member (pengurus).
// Allows updating existing data and uploading a new photo if desired.

interface PageProps {
  params: { id: string };
  searchParams?: { err?: string; field?: string };
}

export default async function AdminPengurusEditPage({ params, searchParams }: PageProps) {
  const member = await prisma.organizationMember.findUnique({ where: { id: params.id } });
  if (!member) return <div>Data tidak ditemukan.</div>;
  // Load all members for parent selection excluding current member to avoid circular reference
  const members = await prisma.organizationMember.findMany({ orderBy: [{ createdAt: "asc" }] });
  const errorMessage = searchParams?.err;
  const errorField = searchParams?.field;

  return (
    <div>
      <h1 className="text-xl font-bold">Edit Pengurus</h1>
      <p className="mt-2 text-sm text-slate-600">Ubah data pengurus. Kosongkan kolom foto jika tidak ingin mengganti.</p>

      <form
        className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
        action={`/api/admin/org/${params.id}/update`}
        method="post"
        encType="multipart/form-data"
      >
        {errorMessage && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Jabatan</label>
            <input
              name="positionTitle"
              defaultValue={member.positionTitle}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "positionTitle" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Nama</label>
            <input
              name="name"
              defaultValue={member.name}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "name" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
              required
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">Parent/Atasan</label>
            <select
              name="parentId"
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "parentId" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
              defaultValue={member.parentId ?? ""}
            >
              <option value="">(root)</option>
              {members
                .filter((x) => x.id !== member.id)
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.positionTitle} — {x.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">No WA (opsional)</label>
            <input
              name="whatsapp"
              defaultValue={member.whatsapp ?? ""}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "whatsapp" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Foto baru (opsional)</label>
            <input name="photo" type="file" accept="image/*" className="mt-1 w-full" />
            {errorField === "photo" && <div className="mt-1 text-xs text-rose-700">File foto tidak valid.</div>}
            {member.photoPath && (
              <div className="mt-1 text-xs text-slate-500">
                <span>Foto saat ini: </span>
                <a
                  href={member.photoPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Lihat foto
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">Urutan</label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={member.sortOrder ?? 0}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "sortOrder" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            />
          </div>
          <div className="flex items-end gap-2">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              defaultChecked={member.isActive}
            />
            <label htmlFor="isActive" className="text-sm font-semibold">
              Aktif
            </label>
          </div>
        </div>
        <button className="w-fit rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800" type="submit">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
