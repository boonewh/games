// Helpers used by every tracker API route to:
//   1. confirm the request is from a signed-in user (via NextAuth)
//   2. lazily upsert a user_profile row for that user on first DB use
//   3. check ownership on protected resources

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { supabase } from '@/lib/supabase'

export interface TrackerSession {
  userId: string
  name: string | null
  email: string | null
}

export async function getTrackerSession(): Promise<TrackerSession | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return {
    userId: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null
  }
}

/**
 * Ensures a user_profile row exists for the current session user.
 * Idempotent — safe to call on every request.
 */
export async function ensureUserProfile(session: TrackerSession): Promise<void> {
  const { error } = await supabase.from('user_profile').upsert(
    {
      user_id: session.userId,
      display_name: session.name
    },
    { onConflict: 'user_id', ignoreDuplicates: true }
  )
  if (error) throw new Error(`user_profile upsert failed: ${error.message}`)
}

/**
 * Returns true if the user owns the character OR is GM of the character's party.
 * Used to gate writes to a character and its nested resources.
 */
export async function canEditCharacter(userId: string, characterId: string): Promise<boolean> {
  const { data: character, error } = await supabase
    .from('character')
    .select('user_id, party_id')
    .eq('id', characterId)
    .maybeSingle()

  if (error || !character) return false
  if (character.user_id === userId) return true

  if (character.party_id) {
    const { data: party } = await supabase
      .from('party')
      .select('gm_user_id')
      .eq('id', character.party_id)
      .maybeSingle()
    if (party?.gm_user_id === userId) return true
  }

  return false
}

/**
 * Returns true if the user can view a character — currently same rule as edit.
 * Carved out separately because "share with party" view-only mode will land here.
 */
export async function canViewCharacter(userId: string, characterId: string): Promise<boolean> {
  return canEditCharacter(userId, characterId)
}
