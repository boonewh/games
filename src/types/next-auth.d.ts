// Module augmentation for NextAuth v4 — adds `id` to the session user
// alongside the default `name`/`email`/`image` fields. The `import` lines
// make this a proper module-augmentation file (not just an ambient .d.ts),
// which is required for the augmentation to merge correctly.

import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}
