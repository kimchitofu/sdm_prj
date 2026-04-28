import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'auth-token'

// Paths campaign_admin is permitted to visit
const CAMPAIGN_ADMIN_ALLOWED = [
  '/dashboard/admin/campaign-dashboard',
  '/dashboard/admin/campaigns',
  '/dashboard/admin/donation-reports',
]

// Decodes the JWT payload to read the role.
// Signature verification is intentionally skipped here because:
//   1. The cookie is HttpOnly — clients cannot forge it via JavaScript.
//   2. All API routes still perform full HMAC verification via getSession().
//      A forged cookie can bypass this UI redirect but not any data endpoint.
function decodeJWT(token: string): { role: string; exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const body = parts[1]
    const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null
    return { role: payload.role, exp: payload.exp }
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/dashboard/admin')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.next()

  const session = decodeJWT(token)
  if (!session) return NextResponse.next()

  if (session.role === 'campaign_admin') {
    const allowed = CAMPAIGN_ADMIN_ALLOWED.some((prefix) => pathname.startsWith(prefix))
    if (!allowed) {
      return NextResponse.redirect(new URL('/dashboard/admin/campaign-dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/admin/:path*'],
}
