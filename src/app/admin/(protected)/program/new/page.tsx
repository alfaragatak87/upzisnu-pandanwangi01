"use client";

// New program creation page with preview feature.
// Allows admin to fill fields and preview the program card before submitting.

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ProgramNewPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("err");
  const errorField = searchParams.get("field");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const togglePreview = () => {
    setShowPreview((prev) => !prev);
  };

  return (
    <div>
      <Link href="/admin/program" className="text-sm font-semibold underline">
        ← Kembali
      </Link>
      <h1 className="mt-3 text-xl font-bold">Tambah Program</h1>
      <form
        className="mt-6 space-y-4"
        action="/api/admin/program/create"
        method="post"
        encType="multipart/form-data"
      >
        {errorMessage && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
        )}
        <div>
          <label className="text-sm font-semibold">Judul</label>
          <input
            name="title"
            className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "title" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Kategori</label>
          <input
            name="category"
            className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "category" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Deskripsi</label>
          <textarea
            name="description"
            className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "description" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">Urutan</label>
            <input
              name="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${errorField === "sortOrder" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            />
          </div>
          <div className="flex items-end gap-2">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="isActive" className="text-sm font-semibold">
              Aktif
            </label>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold">Gambar (opsional)</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="mt-1 w-full"
            onChange={handleImageChange}
          />
          {errorField === "image" && <p className="mt-1 text-xs text-rose-700">File gambar tidak valid.</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            onClick={togglePreview}
          >
            {showPreview ? "Sembunyikan Preview" : "Preview"}
          </button>
          <button
            className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
            type="submit"
          >
            Simpan
          </button>
        </div>
        {showPreview && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-bold">Preview Program</h2>
            <p className="mt-1 text-sm text-slate-600">Ini adalah pratinjau sederhana sebelum dipublikasikan.</p>
            <div className="mt-4">
              <h3 className="text-xl font-semibold">{title || "Judul program"}</h3>
              <p className="mt-1 text-sm uppercase text-brand-700">{category || "Kategori"}</p>
              <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{description || "Deskripsi program akan muncul di sini."}</p>
              {imageFile && (
                <p className="mt-3 text-xs text-slate-500">Gambar akan di-upload: {imageFile.name}</p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Status: {isActive ? "Aktif (akan ditampilkan)" : "Draft (tidak ditampilkan)"}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
