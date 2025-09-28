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

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setBusy(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

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

    fileInput.value = "";
    await refresh();
  }

  return (
    <section className="space-y-6">
      <form onSubmit={onUpload} className="flex items-center gap-3">
        <input
          type="file"
          name="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
          className="block w-full text-sm"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-50"
        >
          {busy ? "Uploading..." : "Upload"}
        </button>
      </form>

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
            {f.fileUrl && (
              <a
                className="text-cyan-400 text-sm underline mt-2 inline-block"
                href={f.fileUrl}
                target="_blank"
                rel="noreferrer"
              >
                View / Download →
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
