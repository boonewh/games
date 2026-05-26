// Wraps the tracker. Redirects to sign-in if the user isn't authenticated.
// Inherits the wrath theming from the parent /wrath layout.

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'

export default async function TrackerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/wrath/tracker')
  }
  return <>{children}</>
}
