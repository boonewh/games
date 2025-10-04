/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { kv } from '@vercel/kv'

// Simple user store in KV - you can manage this via API or directly in KV dashboard
// Structure: users:<username> = { password: "hashed", id: "unique" }  
// Structure: settings:allowSignups = true/false
// Structure: google_users:<email> = { id: "unique", name: "Display Name", email: "email@domain.com" }

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        action: { label: 'Action', type: 'hidden' } // 'signin' or 'signup'
      },
      async authorize(credentials: any) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const action = credentials.action || 'signin'
        const username = credentials.username.toLowerCase()

        if (action === 'signup') {
          // Check if signups are allowed
          const allowSignups = await kv.get('settings:allowSignups')
          if (!allowSignups) {
            throw new Error('Signups are currently disabled')
          }

          // Check email whitelist for credentials signup
          const allowedEmails = await kv.get('settings:allowedEmails') as string[] || []
          const userEmail = `${username}@local` // Credentials users get @local email
          if (allowedEmails.length > 0 && !allowedEmails.includes(userEmail)) {
            throw new Error('Your email is not authorized for signup')
          }

          // Check if user already exists
          const existingUser = await kv.get(`users:${username}`)
          if (existingUser) {
            throw new Error('User already exists')
          }

          // Create new user (in production, hash the password!)
          const newUser = {
            id: `user_${Date.now()}`,
            username,
            password: credentials.password // TODO: Hash this in production!
          }

          await kv.set(`users:${username}`, newUser)
          
          return {
            id: newUser.id,
            name: username,
            email: `${username}@local`
          }
        }

        // Sign in flow
        const user = await kv.get(`users:${username}`) as { id: string; username: string; password: string } | null
        
        if (!user || user.password !== credentials.password) {
          return null
        }

        return {
          id: user.id,
          name: user.username,
          email: `${user.username}@local`
        }
      }
    })
  ],
  pages: {
    signIn: '/sign-in'
  },
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    async signIn({ user, account }: any) {
      // =======================================================================================================
      // 🚪 MASTER SIGNUP CONTROL - TURN ON/OFF ALL NEW SIGNUPS HERE
      // =======================================================================================================
      
      const allowSignups = await kv.get('settings:allowSignups')
      const allowedEmails = await kv.get('settings:allowedEmails') as string[] || []
      
      if (account?.provider === 'google') {
        const existingGoogleUser = await kv.get(`google_users:${user.email}`)
        
        // If signups are disabled, only allow existing users
        if (!allowSignups && !existingGoogleUser) {
          return false
        }
        
        // If signups are enabled, check email whitelist
        if (allowSignups && !existingGoogleUser) {
          // If whitelist exists and has emails, user must be on the list
          if (allowedEmails.length > 0 && !allowedEmails.includes(user.email.toLowerCase())) {
            return false
          }
        }
        
        // Store Google user info in KV
        await kv.set(`google_users:${user.email}`, {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        })
      } else {
        // For credentials, the authorize function handles signup logic
      }
      
      return true
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        if (user.email) {
          token.email = user.email
        }
      }
      return token
    },
    async session({ session, token }: any) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      if (token?.email) {
        session.user.email = token.email as string
      }
      return session
    }
  }
}

// @ts-expect-error - NextAuth v4 default export handling
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }