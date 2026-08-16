import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const publicRoutes = ['/', '/sign-in', '/sign-up']

const isPublicRoute = (pathname: string) =>
  publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

const isAdminRoute = (pathname: string) =>
  pathname === '/upload' || pathname.startsWith('/upload/')

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname

  if (isPublicRoute(pathname)) {
    return
  }

  const { sessionClaims, userId } = await auth()

  if (!userId) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isAdminRoute(pathname)) {
    const isAdmin = sessionClaims.metadata?.roles === 'admin'

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
