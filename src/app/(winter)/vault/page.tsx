// app/vault/page.tsx
import { auth } from "@clerk/nextjs/server";
import VaultClient from "./vault-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-blue-200">Character Vault</h1>
      <VaultClient />
    </main>
  );
}
