"use client";

// New News (Berita) creation page with preview/draft capability.
// Allows admin to compose Markdown content and preview it before publishing.

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BeritaNewPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("err");
  const errorField = searchParams.get("field");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCoverFile(file);
  };

  return (
    <div>
      <Link href="/admin/berita" className="text-sm font-semibold underline">
        ← Kembali
      </Link>
      <h1 className="mt-3 text-xl font-bold">Tambah Berita</h1>
      <form
        className="mt-6 space-y-4"
        action="/api/admin/news/create"
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
          <label className="text-sm font-semibold">Cover image (opsional)</label>
          <input
            name="cover"
            type="file"
            accept="image/*"
            className="mt-1 w-full"
            onChange={handleCoverChange}
          />
          {errorField === "cover" && <p className="mt-1 text-xs text-rose-700">File cover tidak valid.</p>}
        </div>
        <div>
          <label className="text-sm font-semibold">Isi (Markdown)</label>
          <textarea
            name="contentMarkdown"
            className={`mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm ${errorField === "contentMarkdown" ? "border-rose-300 bg-rose-50/40" : "border-slate-200"}`}
            rows={10}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isPublished"
            name="isPublished"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <label htmlFor="isPublished" className="text-sm font-semibold">
            Publish
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            onClick={() => setShowPreview(!showPreview)}
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
            <h2 className="text-lg font-bold">Preview Berita</h2>
            <p className="mt-1 text-sm text-slate-600">Ini adalah pratinjau isi berita dalam format Markdown.</p>
            <div className="mt-4 space-y-4">
              <h3 className="text-xl font-semibold">{title || "Judul Berita"}</h3>
              {coverFile && (
                <p className="text-xs text-slate-500">Cover akan di-upload: {coverFile.name}</p>
              )}
              <ReactMarkdown className="prose prose-sm max-w-none" remarkPlugins={[remarkGfm]}>{content || "Isi berita akan muncul di sini."}</ReactMarkdown>
              <p className="text-xs text-slate-500">
                Status: {isPublished ? "Publish" : "Draft (tidak ditayangkan)"}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
