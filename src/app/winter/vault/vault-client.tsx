// app/vault/vault-client.tsx
"use client";

import React, { useEffect, useState } from "react";

type FileItem = {
  fileName: string;
  contentLength: number;
  contentType: string;
  uploadedAt: string; // ISO
  fileUrl?: string;   // if public
};

export default function VaultClient() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const res = await fetch("/api/vault/list", { cache: "no-store" });
    if (!res.ok) {
      setError("Failed to load vault files.");
      return;
    }
    const data = await res.json();
    setFiles(data.files || []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const file = formData.get("file") as File;
    
    if (!file || file.size === 0) {
      setError("Please select a file to upload.");
      setBusy(false);
      return;
    }

    const res = await fetch("/api/vault/upload", {
      method: "POST",
      body: formData,
    });

    setBusy(false);

    if (!res.ok) {
      const msg = await res.text();
      setError(msg || "Upload failed.");
      return;
    }

    // Success - clear form and refresh
    form.reset();
    await refresh();
  }

  return (
    <section className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
        <h3 className="text-lg font-semibold text-blue-200 mb-4">Upload Files</h3>
        <form onSubmit={onUpload} className="space-y-4">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-slate-300 mb-2">
              Select a file to upload (.pdf, .jpg, .png, .gif, .webp)
            </label>
            <input
              id="file-upload"
              type="file"
              name="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
              className="block w-full text-sm text-slate-300
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:text-sm file:font-medium
                         file:bg-blue-600 file:text-white
                         hover:file:bg-blue-700
                         file:cursor-pointer cursor-pointer
                         bg-slate-700/50 border border-slate-600/50 rounded-lg p-2"
              disabled={busy}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-50 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            {busy ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </div>

      {error && <p className="text-rose-300">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((f) => (
          <div key={f.fileName} className="rounded-lg border border-slate-600/30 p-4">
            <p className="font-medium text-blue-200 break-all">{f.fileName}</p>
            <p className="text-sm text-slate-400">
              {(f.contentLength / 1024).toFixed(1)} KB • {f.contentType}
            </p>
            <p className="text-xs text-slate-500">
              {new Date(f.uploadedAt).toLocaleString()}
            </p>
            <div className="mt-2 space-x-3">
              {/* Public link (works if bucket is public) */}
              {f.fileUrl && (
                <a
                  className="text-cyan-400 text-sm underline inline-block"
                  href={f.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View →
                </a>
              )}
              
              {/* Download via proxy */}
              <a
                className="text-cyan-300 text-sm underline inline-block"
                href={`/api/vault/proxy?file=${encodeURIComponent(f.fileName)}`}
                download={f.fileName}
              >
                Download →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
