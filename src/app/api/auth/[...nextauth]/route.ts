import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-options'

// Next 16 tries to generate static paths for this catch-all route. The attempt
// crashes its analysis worker ("Failed to generate static paths for
// /api/auth/[...nextauth]" -> "Jest worker encountered 2 child process
// exceptions"), the route never builds, and every request to it returns a 500
// HTML error page. next-auth's client then calls res.json() on that HTML and
// throws CLIENT_FETCH_ERROR: Unexpected token '<', "<!DOCTYPE "...
//
// The likely trigger is that auth-options.ts imports `next/headers`, which is
// request-scoped and cannot be evaluated outside a request.
//
// Auth is request-dependent by definition, so there is nothing here to
// prerender. Declaring it dynamic is correct on its own merits and stops Next
// attempting the analysis at all.
export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
