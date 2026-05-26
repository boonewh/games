// Server-only Supabase client.
// Uses the service-role key, which bypasses RLS — DO NOT import this
// from client components. All access must go through Next.js server-side
// code (route handlers, server actions, server components).

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY

if (!url) throw new Error('SUPABASE_URL is not set in environment')
if (!key) throw new Error('SUPABASE_SECRET_KEY is not set in environment')

export const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})
