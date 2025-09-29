// Server component: lazily load the client-only editor to satisfy useSearchParams/CSR requirements.
import { Suspense } from "react";
export const dynamic = "force-dynamic";

import nextDynamic from "next/dynamic";
const EditorClient = nextDynamic(() => import("./EditorClient"), { ssr: false });

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <EditorClient />
    </Suspense>
  );
}
