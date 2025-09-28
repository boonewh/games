import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/editor(.*)', '/vault(.*)'])

export default clerkMiddleware(async (auth, req) => {
  console.log('🔍 Middleware running for:', req.nextUrl.pathname)
  console.log('🛡️ Is protected route?', isProtectedRoute(req))
  
  if (isProtectedRoute(req)) {
    console.log('🔒 Protecting route - calling auth.protect()')
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}