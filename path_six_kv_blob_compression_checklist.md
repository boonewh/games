# PathSix: KV + Blob + Compression — Checklist

A concise, no-code plan to run stories via **Vercel KV** and images via **Vercel Blob**, with server-side image compression. Keep this at the repo root.

---
## Phase 1 — Decisions
- **Stories:** Store TipTap JSON in **Vercel KV**.
- **Images:** Store user uploads in **Vercel Blob**.
- **Compression:** Server-side during upload (Sharp), output **WebP**.
- **Keys/Paths:**
  - KV key: `story:{book}:{date}:{slug}`
  - List keys: `list:{book}` and optionally `list:all`
  - Blob path: `winter/{timestamp}-{basename}.webp`

---
## Phase 2 — Vercel Setup (Dashboard)
- Enable **Vercel KV** for the project.
- Enable **Vercel Blob** for the project.
- Note the Blob **public host** (ends with `public.blob.vercel-storage.com`).
- Add **env vars** for KV + Blob (Development, Preview, Production).
- In `next.config.js`, add Blob host to **`images.remotePatterns`**.
- Uninstall **client-side** image compression libs you’re not using.

---
## Phase 3 — Storage Model
**KV (stories)**
- `story:{book}:{date}:{slug}` → full JSON `{ date, book, story:[...] [, coverUrl] }`
- `list:{book}` → newest-first IDs (the story keys)
- `list:all` (optional) → newest-first across all books

**Blob (images)**
- Always write **WebP**, `image/webp` content type.
- Path convention: `winter/{timestamp}-{basename}.webp`.

---
## Phase 4 — Upload & Compression Policy
- **Allowed types in:** jpeg, png, webp, gif → convert to **WebP**.
- **Resize:** max width **1600px** (no enlargement).
- **Quality:** **80**.
- **EXIF:** auto-rotate; strip metadata unless needed.
- **Max upload size:** choose (e.g., **10 MB** pre-compress).
- **Return:** Blob **public URL**.

---
## Phase 5 — API Behavior (Conceptual)
**Upload route**
- Auth → MIME & size checks → read → compress (WebP) → save to Blob → return URL.

**Create/Update story**
- Auth → accept `{ date, book, story[] [, coverUrl] }` → write KV at `story:{...}` → update `list:{book}` (and `list:all` if used) → return key.

**Read flows**
- **Listing:** read top N from `list:{book}` / `list:all` → fetch keys → render.
- **Detail:** fetch `story:{book}:{date}:{slug}` → render.

---
## Phase 6 — Guardrails & Security
- **Rate-limit** uploads (e.g., N per minute per IP/user).
- **Validate** MIME & size; **reject SVG** by default.
- **Sanitize** basenames (alnum, dash, underscore) for Blob keys.
- **Runtime:** ensure Node runtime for image processing.
- **Logs:** record user id, KV key, Blob key/URL.

---
## Phase 7 — Local vs Production
- **Local:** you may write to disk for quick tests, but verify the **KV + Blob** path end-to-end.
- **Production:** never write to `public/` or `/content` at runtime.
- Use cache-busting query during testing to avoid stale images.

---
## Phase 8 — Test Checklist
- PNG → compressed WebP smaller than original.
- Phone-rotated JPEG → correct orientation.
- Large image (>1600px) → resized.
- Create story referencing returned image URL → shows in list + detail.
- Hard refresh / disable browser cache → correct asset served.
- Unsupported type (e.g., SVG) → friendly error.
- Oversized file → friendly error.

---
## Phase 9 — Costs & Limits Snapshot
- **KV Free:** 256 MB storage, 50k reads + 50k writes/month.
- **Blob Free:** ~1 GB storage, ~100k requests/month (check Vercel dashboard for current numbers).

---
## Phase 10 — Nice-to-haves (Later)
- **Thumbnails:** store a small thumb alongside full image.
- **Soft delete:** mark deleted without breaking links.
- **Backups:** periodic KV dump + Blob inventory.
- **Abstraction:** wrap storage calls (`saveEntry`, `getEntry`, `listEntries`, `uploadImage`) to allow future migration (e.g., to Postgres).

