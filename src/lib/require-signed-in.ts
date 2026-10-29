import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { authOptions } from './auth-options'

/** Verify the signed session without creating a tracker profile or changing data. */
export async function requireSignedIn(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)
  return session?.user ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
