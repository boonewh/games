'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import VaultClient from "./vault-client"

export default function VaultPageClient() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/sign-in')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <main className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="text-center text-blue-200">Loading...</div>
      </main>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-blue-200">Character Vault</h1>
      <VaultClient />
    </main>
  )
}