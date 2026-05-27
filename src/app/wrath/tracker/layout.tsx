// Wraps the tracker. Redirects to sign-in if the user isn't authenticated.
// Inherits the wrath theming from the parent /wrath layout.

import { redirect } from 'next/navigation'
import { getTrackerSession } from '@/lib/tracker/auth'

export default async function TrackerLayout({ children }: { children: React.ReactNode }) {
  const session = await getTrackerSession()
  if (!session) {
    redirect('/sign-in?callbackUrl=/wrath/tracker')
  }
  return <>{children}</>
}
