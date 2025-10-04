import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware() {
    // This runs only when the user is authenticated
    return
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect /editor and /vault routes
        if (req.nextUrl.pathname.startsWith('/editor') || 
            req.nextUrl.pathname.startsWith('/vault')) {
          return !!token // Only allow if user has a token (is signed in)
        }
        
        // All other routes are public
        return true
      }
    }
  }
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};