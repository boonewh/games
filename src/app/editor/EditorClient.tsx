"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useRouter, useSearchParams } from "next/navigation";
import imageCompression from "browser-image-compression";

type JSONNode = {
  type?: string;
  content?: JSONNode[];
  text?: string;
};

function getExcerptFromContent(json: unknown, limit = 220): string {
  if (!json || typeof json !== "object") return "";
  const content = (json as { content?: JSONNode[] }).content;
  if (!Array.isArray(content)) return "";
  for (const node of content) {
    if (node?.type === "paragraph" && Array.isArray(node.content)) {
      const text = node.content
        .filter((child) => child?.type === "text" && typeof child.text === "string")
        .map((child) => child.text as string)
        .join("")
        .trim();
      if (text) {
        return text.slice(0, limit);
      }
    }
  }
  return "";
}

const adventureBooks = [
  { slug: "the-snows-of-summer", title: "The Snows of Summer", bookNumber: 1 },
  { slug: "the-shackled-hut", title: "The Shackled Hut", bookNumber: 2 },
  { slug: "maiden-mother-crone", title: "Maiden, Mother, Crone", bookNumber: 3 },
  { slug: "the-frozen-stars", title: "The Frozen Stars", bookNumber: 4 },
  { slug: "rasputin-must-die", title: "Rasputin Must Die!", bookNumber: 5 },
  { slug: "the-witch-queen-revenge", title: "The Witch Queen's Revenge", bookNumber: 6 },
];

export default function EditorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams.get("id");
  const isEditing = Boolean(entryId);

  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [book, setBook] = useState(adventureBooks[0].slug);
  const [sessionDate, setSessionDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write the tale of tonight…",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[300px] p-4 bg-slate-900/40 rounded-2xl border border-slate-700 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      try {
        const json = editor.getJSON();
        setExcerpt(getExcerptFromContent(json));
      } catch {
        setExcerpt("");
      }
    };

    handleUpdate();
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  useEffect(() => {
    if (!isEditing || !entryId || !editor) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/entries/${entryId}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? "Entry not found" : "Failed to load entry");
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTitle(data.title ?? "");
        setImage(data.image ?? "");
        setExcerpt(data.excerpt ?? "");
        setBook(data.book ?? adventureBooks[0].slug);
        setSessionDate(data.sessionDate ?? "");
        editor.commands.setContent(data.content ?? "");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load entry");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editor, entryId, isEditing]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/jpeg" as const,
      };

      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append("image", compressedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();
      setImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave() {
    if (!editor || !sessionDate) {
      setError("Please select a session date");
      return;
    }
    setSaving(true);
    setError(null);
    const content = editor?.getJSON();
    const payload = {
      title,
      image: image.trim() ? image.trim() : undefined,
      excerpt,
      content,
      book,
      sessionDate,
    };

    const endpoint = isEditing && entryId ? `/api/entries/${entryId}` : "/api/entries";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Save failed");
      }
      const saved = (await res.json()) as { id?: string };
      if (saved?.id) {
        router.push(`/adventure-log/${saved.id}`);
      } else {
        router.push(`/adventure-log/${book}?t=${Date.now()}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const selectedBook = adventureBooks.find((b) => b.slug === book);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-100 font-['Alkatra'] mb-2">
            {isEditing ? "Edit Chronicle Entry" : "Chronicle a New Adventure"}
          </h1>
          <p className="text-slate-400">Record the tales of your journey through the endless winter</p>
        </div>

        {isEditing && (
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <p className="text-sm text-slate-400">
              Updating existing entry <span className="font-mono text-slate-300">{entryId}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Book Selection and Date */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Adventure Book</label>
            <select
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              {adventureBooks.map((book) => (
                <option key={book.slug} value={book.slug}>
                  Book {book.bookNumber}: {book.title}
                </option>
              ))}
            </select>
            {selectedBook && (
              <p className="text-xs text-slate-400 mt-1">
                Currently chronicling: Book {selectedBook.bookNumber}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Session Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:outline-none"
              required
            />
            <p className="text-xs text-slate-400 mt-1">When did this adventure take place?</p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">Entry Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The Frozen Wastes of Irrisen..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:outline-none text-lg"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">
            Chronicle Image <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60 transition ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {uploading ? "Uploading..." : "Upload Image"}
              </label>
              {image && (
                <button onClick={() => setImage("")} className="text-red-400 hover:text-red-300 text-sm">
                  Remove
                </button>
              )}
            </div>
            {image && (
              <div className="relative">
                <Image
                  src={image}
                  alt="Chronicle preview"
                  width={320}
                  height={128}
                  className="max-w-sm h-32 object-cover rounded-lg border border-slate-600"
                />
                <div className="text-xs text-slate-400 mt-1">Image ready for chronicle</div>
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div>
          <label className="block text-sm font-semibold text-blue-200 mb-2">Chronicle Content</label>
          {editor && <EditorContent editor={editor} />}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/40 rounded-xl p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Excerpt preview:</p>
              <p className="text-xs text-slate-500 italic">
                {excerpt ? `"${excerpt}…"` : "Write content to see preview..."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {loading && <span className="text-xs text-slate-500">Loading entry…</span>}
              <button
                onClick={handleSave}
                disabled={!editor || saving || loading || !sessionDate}
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-6 py-3 text-white font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 shadow-lg"
              >
                {saving ? "Saving Chronicle…" : isEditing ? "Update Entry" : "Save Chronicle"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
