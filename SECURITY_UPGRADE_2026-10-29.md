# Games security maintenance — October 29, 2026

This candidate starts from main/production `a6d9ccb`. Implementation was approved;
production deployment requires review of the tested result. No database migration,
account cleanup, credential rotation or hosted setting change is included.

## Changes and behavior

- Next16.4.3, React/DOM19.2.9, NextAuth4.24.15, Sharp0.35.5; Tiptap3.32.1 packages
  aligned, Supabase2.118.0, Blob2.8.2, Tailwind/PostCSS plugin4.3.3, Vitest4.1.12
  and compatible transitive security patches. The final lockfile has zero known
  npm advisories, including development packages.
- Scoped compatible fixes: typography's selector-parser6.1.5 and Vercel CLI
  configuration's Zod4.6.7. Configuration schema compatibility is tested.
  Anthropic0.99 and Backblaze1.7 remain on their existing lines.
- Node24.22.1 pins, Node24 package range/types and pinned Ubuntu24.04/Node24 CI.
  Effective Vercel runtime must be verified when releasing; the original project's
  old Node22 default has not been changed during candidate preparation.
- A shared verified NextAuth session check protects settings/account APIs, story
  mutations, image uploads/deletes and private vault operations **before** body
  parsing or service calls. Cookie-name presence is no longer authorization.
  The helper does not create a Supabase profile or touch storage.
- Retired `/api/setup` always returns410 and cannot reset accounts, signups or
  email allowlists. Existing stored settings/accounts are not rewritten.
- Public campaign/story/gallery reads and the existing eight public PDF filenames
  remain public. Signed-in members retain shared editor/admin access. Tracker
  ownership and private GM-note rules are unchanged. NextAuth provider settings,
  secrets, cookies and session strategy are preserved.
- Disable implicit PostgREST retries so the existing tracker retry decisions and
  request timing remain under application control. Mocked transport tests verify
  reads and each mutation type are sent once on a transient failure.
- Repair the removed `next lint` command and align Next's flat lint configuration.
  Original Hooks checks remain; adopting React Compiler recommendations is deferred
  because this app does not enable that compiler. No existing Hooks check was removed.
  ESLint9.39.5 is retained for current React/import/accessibility plugin peer
  compatibility; its EOL is a tooling-support limitation pending plugin updates.
- Two existing redundant `let` declarations are now `const`. Decorative lines in
  the Wrath map overlay fit mobile width while retaining their previous desktop size.

## Verification and limits

- Baseline:103 existing tests and TypeScript passed. `npm run lint` was broken;
  direct old-source lint found two errors/four warnings. Two errors were fixed.
- Candidate: **142 tests pass** across12 files, **six browser cases pass**, TypeScript
  and production build pass. Lint: **zero errors, five advisory warnings** (three
  existing unused declarations and two new internal-navigation recommendations).
- Actual encrypted NextAuth sessions, chunked cookies, missing/fabricated/expired
  sessions and wrong-secret tokens are tested. Twenty protected method/route pairs
  reject unsigned requests before service access; public sheets and valid member
  operations retain their intended behavior. Setup performs no writes.
- Native PNG/JPEG/WebP/GIF upload conversion and miniature JPEG resizing pass.
  Tiptap retains old plain-text content, bold marks and original story identity
  through an update. Owner/GM/member checks and private GM-note boundaries pass.
- Browser tests use a loopback production server, synthetic sessions/configuration,
  and mocked game/storage data. No real database/KV/blob/vault writes, reset/signup
  changes, Google login or paid Anthropic request was used. Live Google/credential
  sign-in and authenticated hosted workflows are not claimed as verified here.
- Forged-cookie browser probes intentionally produce NextAuth rejection diagnostics.
  A test initially selected the hidden desktop heading on mobile; the assertion
  was corrected. Mobile testing then found and verified the narrow map-overlay fix.
- CI runs the same checks on Linux with synthetic configuration. Check the PR's
  exact-revision result before release. Google Fonts remain build-time downloads;
  the final local build fetched/cached them successfully without a font/theme change.

## Source preservation and release

Original `G:\Projects\games` remains at its previous clean tracked source, with
two untracked attachments preserved under the local upgrade backup. Its private
`.env.local` and original dependencies were not changed or uploaded. Use the pinned
patched Node runtime for future development; after release, fetch/pull the recorded
source and refresh dependencies before deploying from that older original folder.

The central report/tracker under `G:\Projects\upgrades` records candidate source,
CI, preview and final release status. A passing preview does not itself authorize
main merge or production deployment. Preserve existing signup/allowlist settings,
game records, Blob/B2 contents and Supabase schema through release.
