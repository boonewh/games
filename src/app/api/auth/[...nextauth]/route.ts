import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-options'

// @ts-expect-error - NextAuth v4 default export handling
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
